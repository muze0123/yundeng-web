import Foundation
import Vision
import AppKit

let root = URL(fileURLWithPath: "/Users/zhangbin/Desktop/YunLogin")
let output = URL(fileURLWithPath: "/Users/zhangbin/Desktop/灵匠/云登pc端/YunLogin图片文字索引.tsv")
let fm = FileManager.default
let extensions = Set(["png", "jpg", "jpeg", "webp"])
let keys: [URLResourceKey] = [.isRegularFileKey]
let files = (fm.enumerator(at: root, includingPropertiesForKeys: keys)?.allObjects as? [URL] ?? [])
    .filter { extensions.contains($0.pathExtension.lowercased()) }
    .sorted { $0.path < $1.path }

var rows = ["relative_path\twidth\theight\tocr_text"]
for (index, url) in files.enumerated() {
    autoreleasepool {
        guard let image = NSImage(contentsOf: url),
              let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
            rows.append("\(url.path.replacingOccurrences(of: root.path + "/", with: ""))\t0\t0\t[IMAGE_READ_FAILED]")
            return
        }
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["zh-Hans", "en-US"]
        request.usesLanguageCorrection = true
        request.minimumTextHeight = 0.006
        do {
            try VNImageRequestHandler(cgImage: cg, options: [:]).perform([request])
            let text = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
                .joined(separator: " | ")
                .replacingOccurrences(of: "\t", with: " ")
                .replacingOccurrences(of: "\n", with: " ")
            let rel = url.path.replacingOccurrences(of: root.path + "/", with: "")
            rows.append("\(rel)\t\(cg.width)\t\(cg.height)\t\(text)")
        } catch {
            let rel = url.path.replacingOccurrences(of: root.path + "/", with: "")
            rows.append("\(rel)\t\(cg.width)\t\(cg.height)\t[OCR_FAILED: \(error)]")
        }
        if (index + 1) % 25 == 0 { fputs("OCR \(index + 1)/\(files.count)\n", stderr) }
    }
}
try rows.joined(separator: "\n").write(to: output, atomically: true, encoding: .utf8)
print("WROTE \(rows.count - 1) rows to \(output.path)")
