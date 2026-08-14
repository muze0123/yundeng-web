import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const cwd = process.cwd();
const outDir = path.join(cwd, 'outputs/yunlogin_adspower_price_compare');
await fs.mkdir(outDir, { recursive: true });

const fx = 7.20;
const colors = {
  red: '#F4CCCC', yellow: '#FFF2CC', green: '#D9EAD3', blue: '#CFE2F3', gray: '#E7E6E6',
  navy: '#1F4E78', title: '#D9EAF7', white: '#FFFFFF', pale: '#F7F9FC', border: '#D9E1F2', ink: '#17365D'
};

const modes = [
  ['获客套餐','永久免费套餐','2环境、1名免费成员，$0永久使用','现有价格清单未记录免费套餐','材料未覆盖','黄色','AdsPower有明确免费入口；YunLogin无直接证据，不能断言不存在','P1','核实YunLogin注册后的免费额度、有效期和付费功能限制'],
  ['获客套餐','限时试用套餐','Trial：12环境、2名成员，$14/月；含高级能力','现有价格清单未记录独立试用套餐','材料未覆盖','黄色','AdsPower有明确Trial；YunLogin无直接证据','P1','核实是否有试用期、试用配额或新客优惠替代机制'],
  ['浏览器套餐','按环境数订阅','专业10～100、商业200～5000；环境采用分段累进计价','10～5000快捷预设并支持连续步进调整','双方均有但规则不同','蓝色','均按环境规模收费；AdsPower公开累进单价，YunLogin底层公式未完整披露','—','比较边际单价、权益差异和升级路径'],
  ['浏览器套餐','命名版本分层','专业版、商业版、企业版承载不同服务定位','当前材料为统一环境套餐，未确认专业/商业版本分层','双方均有但架构不同','蓝色','YunLogin有套餐但未采用相同版本命名和权益分层','P1','判断目标用户是否需要按服务权益而非仅环境数分层'],
  ['浏览器套餐','企业套餐与询价','5000以上企业版，可询价、专属客服及部分定制开发','明确不存在已确认的企业套餐档；5000只是快捷预设','明确没有','红色','YunLogin材料明确否定企业档，AdsPower明确提供企业询价模式','P0','先验证大客户规模、合同采购、SLA和定制需求，不直接照搬'],
  ['浏览器套餐','环境累进阶梯单价','$0.90→$0.01/环境/月，按区间累进计算','10～13环境增量不完全等差，疑似分段或舍入；完整公式未披露','材料未覆盖','黄色','AdsPower计价曲线明确；YunLogin只能从样例推测，不能确认同类模式','P0','补齐YunLogin完整环境数定价函数、上限和舍入规则'],
  ['浏览器套餐','额外成员独立计费','$5/人/月，无阶梯，随套餐周期折扣','¥19/人，最终金额受周期和折扣影响','双方均有但价格不同','蓝色','均拆分环境与协作价值，但币种、绝对价格和折扣口径不同','—','结合团队渗透率评估成员费对ARPU和扩张阻力的影响'],
  ['浏览器套餐','四周期订阅','30/90/180/360天，折扣1/0.9/0.85/0.8','30/90/180/360天，当期折扣0.85/0.8/0.75/0.5','双方均有但折扣不同','蓝色','周期一致；YunLogin当前长期折扣更深，但含限时活动属性','—','区分常规价与活动价，避免用短期促销判断长期价格策略'],
  ['套餐变更','剩余周期补差','升级/更改套餐按剩余周期产生短期补差示例','现套餐总价÷总天数×剩余天数抵扣新套餐','双方核心模式一致','绿色','双方均支持按剩余价值补差或抵扣','—','继续核实AdsPower与YunLogin的舍入、跨币种和优惠回收规则'],
  ['套餐变更','减配退款边界','价格清单未确认减配退款公式','减配不退费','不可直接比较','灰色','YunLogin规则明确，AdsPower材料不足','—','不据此判断AdsPower没有；补充双方正式退款政策'],
  ['买断模式','终身环境','$15/环境；最多额外8个；与订阅并存；不退款','现有材料未记录终身环境商品','材料未覆盖','黄色','AdsPower明确存在一次性买断；YunLogin无直接证据','P1','评估低频小用户买断需求、订阅蚕食和长期服务成本'],
  ['代理商品','静态数据中心代理','Socks5，$5.99～$7.99/IP/30天','云平台静态代理，约¥55.90～¥79.90/月；资源卡和协议口径不同','双方均有但资源不可等质比较','蓝色','均有静态代理，但供应商、线路、质量、城市和协议不同，不能只比金额','—','建立同国家、同协议、同质量和同SLA的可比样本'],
  ['代理商品','静态ISP住宅代理','Socks5，$7.99～$10.99/IP/30天','全球家庭住宅静态代理，约¥19.90～¥102.90/月','双方均有但资源不可等质比较','蓝色','均有住宅类静态代理，资源质量和地区颗粒度不同','—','用成功率、纯净度、可用时长和售后共同评估性价比'],
  ['代理商品','动态住宅流量包','1/5/10/50/100GB及>1000GB定制，按GB与有效期计价','现有价格清单未记录动态住宅流量包','材料未覆盖','黄色','AdsPower有明确流量包；YunLogin无直接价格证据','P1','核实YunLogin是否销售动态流量、计费单位和供应商'],
  ['代理商品','代理周期折扣','静态代理30/90/180/360天，1/0.95/0.9/0.85','家庭住宅1/3/12月含8折、4折和首月免费；云平台1/3/6/12月部分9/8.5/8折','双方均有但规则不同','蓝色','周期和促销结构不同，且YunLogin按资源卡区分是否折扣','—','将常规折扣、限时活动和供应商促销分层记录'],
  ['代理商品','首月免费活动','价格清单未记录同类活动','家庭住宅3/12月满足条件时首月免费，截止2026-09-09','仅YunLogin确认','灰色','YunLogin当前促销更强，但具有明确截止日期','—','到期后重新核实，不把活动价视为常规定价'],
  ['增值商品','付费RPA模板','已确认模板商品；示例$6，含手续费后$7.12','现有价格清单未记录付费RPA模板','材料未覆盖','黄色','AdsPower有增值内容交易证据；YunLogin无价格证据','P2','先验证模板供给、交易规模、质量责任和退款规则'],
  ['支付与钱包','支付手续费','常见规则：2%×订单金额+$1；代理、终身环境、模板有示例','现有订单示例未显示同类额外手续费','材料未覆盖','黄色','不能因YunLogin示例未显示就断言永久免手续费','P1','核实各支付渠道、商品和地区的手续费承担方'],
  ['支付与钱包','多币种钱包','USD、BRL、PLN、VND','云币按1元=1云币，当前为人民币口径','双方均有但币种范围不同','蓝色','均有余额体系；AdsPower覆盖多币种，YunLogin偏人民币市场','P1','结合目标市场评估多币种、汇兑和本地支付需求'],
  ['支付与钱包','支付渠道','Alipay、WeChat Pay、Card、PayPal、PIX、VietQR、momo、ZaloPay等','支付宝、微信、云币；其他方式咨询客服','双方均有但覆盖不同','蓝色','AdsPower国际本地化渠道更广','P1','按重点国家支付成功率和成本确定渠道优先级'],
  ['支付与钱包','固定/自定义充值与CDKEY','钱包充值存在，完整固定档位与CDKEY规则未确认','¥50/500/1000/5000/10000、自定义金额、CDKEY','仅YunLogin确认','灰色','YunLogin证据更完整，不能反推AdsPower没有','—','比较充值转化、沉淀余额和合规成本'],
  ['订单结算','购物车多商品合并结算','现有价格清单未记录独立购物车模式','支持多选商品、子订单、优惠、批量删除和合并支付','仅YunLogin确认','灰色','YunLogin已确认，AdsPower证据不足','—','衡量跨代理/套餐的连带购买率和优惠分摊复杂度'],
  ['续费留存','自动续费','套餐及代理可从钱包续期','代理与套餐均有自动续费入口，套餐从云币余额扣款','双方核心模式一致','绿色','双方均用余额与自动续费降低中断','—','核实价格变更、余额不足、失败重试和取消规则'],
  ['售后','退款、税费和发票','大部分规则仍待补充；终身环境明确不退款','代理不可退换、套餐减配不退；其余规则待补充','双方信息均不完整','灰色','无法进行完整TCO和售后风险比较','P0','补齐正式退款政策、税费、发票、到账SLA和优惠回收规则'],
];

const adsBase = [
  [10, 9.00], [50, 21.00], [100, 36.00], [200, 61.00], [500, 126.00], [1000, 197.00], [2000, 297.00], [5000, 597.00]
];
const yunBase = [
  [10, 19.00, 16.15, 45.60, 85.50, 114.00],
  [50, 130.20, 110.67, 312.48, 585.90, 781.20],
  [100, 198.10, 168.39, 475.44, 891.45, 1188.60],
  [200, 302.10, 256.79, 725.04, 1359.45, 1812.60],
  [500, 455.10, 386.84, 1092.24, 2047.95, 2730.60],
  [1000, 712.00, 605.20, 1708.80, 3204.00, 4272.00],
  [2000, 1014.00, 861.90, 2433.60, 4563.00, 6084.00],
  [5000, 1516.00, 1288.60, 3638.40, 6822.00, 9096.00],
];
const periods = [
  [30, 1.00, 0.85, 3], [90, 0.90, 0.80, 4], [180, 0.85, 0.75, 5], [360, 0.80, 0.50, 6]
];

const proxyRows = [
  ['静态数据中心代理','AdsPower','$5.99～$7.99/IP','30天','90/180/360天享0.95/0.9/0.85折','Socks5；国家级报价','Adspower产品价格清单.md:76-108'],
  ['静态ISP住宅代理','AdsPower','$7.99～$10.99/IP','30天','90/180/360天享0.95/0.9/0.85折','Socks5；国家级报价','Adspower产品价格清单.md:90-108'],
  ['动态住宅代理','AdsPower','$3.99/GB起；100GB包$199.50','30～180天','5GB至100GB折扣0.85至0.5；>1000GB询价','按流量包计费','Adspower产品价格清单.md:112-121'],
  ['全球家庭住宅静态代理','YunLogin','¥19.90～¥102.90/IP/月','1/3/12月','3月8折、12月4折；活动期首月免费','城市/资源卡/号段；报价受库存和活动影响','YunLogin产品价格清单.md:14-75'],
  ['云平台静态代理','YunLogin','¥55.90～¥79.90/IP/月（已覆盖代表样本）','1/3/6/12月','部分资源9/8.5/8折，部分无折扣','城市/资源卡；同地区可有不同报价','YunLogin产品价格清单.md:77-121'],
];

const workbook = Workbook.create();
const dash = workbook.worksheets.add('价格对比看板');
const mode = workbook.worksheets.add('价格模式对比');
const matrix = workbook.worksheets.add('套餐金额对比');
const adsSheet = workbook.worksheets.add('AdsPower套餐基价');
const yunSheet = workbook.worksheets.add('YunLogin套餐价格');
const proxy = workbook.worksheets.add('代理与增值价格');
const legend = workbook.worksheets.add('假设与图例');
for (const sh of [dash, mode, matrix, adsSheet, yunSheet, proxy, legend]) sh.showGridLines = false;

function title(sh, range, text) {
  sh.getRange(range).merge(); sh.getRange(range.split(':')[0]).values = [[text]];
  sh.getRange(range).format = { fill: colors.navy, font: { bold: true, size: 18, color: colors.white }, horizontalAlignment: 'center', verticalAlignment: 'center' };
}
function header(sh, range, values) {
  sh.getRange(range).values = [values];
  sh.getRange(range).format = { fill: colors.navy, font: { bold: true, color: colors.white }, wrapText: true, horizontalAlignment: 'center', verticalAlignment: 'center', borders: { preset: 'outside', style: 'thin', color: '#9EADBA' } };
}
function widths(sh, spec) { for (const [col, width] of Object.entries(spec)) sh.getRange(`${col}:${col}`).format.columnWidth = width; }
function rowFill(sh, row, endCol, kind) {
  const map = { '红色': colors.red, '黄色': colors.yellow, '绿色': colors.green, '蓝色': colors.blue, '灰色': colors.gray };
  sh.getRange(`A${row}:${endCol}${row}`).format.fill = map[kind] || colors.white;
}

title(mode, 'A1:I1', 'YunLogin 与 AdsPower 价格模式逐项对比');
mode.getRange('A2:I2').merge(); mode.getRange('A2').values = [['红=AdsPower有且YunLogin明确没有；黄=AdsPower有而YunLogin材料未覆盖；蓝=双方均有但模式不同；绿=核心模式一致；灰=仅单边确认或不可比较。']];
mode.getRange('A2:I2').format = { fill: colors.pale, font: { italic: true, color: '#44546A' }, wrapText: true };
header(mode, 'A3:I3', ['能力域','价格/套餐模式','AdsPower','YunLogin','YunLogin证据状态','差异颜色','判定依据','优先级','建议动作']);
mode.getRange(`A4:I${modes.length+3}`).values = modes;
mode.getRange(`A4:I${modes.length+3}`).format = { wrapText: true, verticalAlignment: 'top', font: { size: 9 }, borders: { insideHorizontal: { style: 'thin', color: '#E6E9ED' } } };
for (let i=0;i<modes.length;i++) rowFill(mode, i+4, 'I', modes[i][5]);
mode.freezePanes.freezeRows(3); mode.freezePanes.freezeColumns(2);
widths(mode, {A:16,B:24,C:44,D:44,E:18,F:12,G:48,H:10,I:52});
const modeTable = mode.tables.add(`A3:I${modes.length+3}`, true, 'PricingModeComparison'); modeTable.style='TableStyleMedium2'; modeTable.showBandedRows=false;

title(adsSheet, 'A1:G1', 'AdsPower 浏览器套餐基价与累进计价');
header(adsSheet, 'A3:G3', ['环境数','月付环境商品价（USD）','折算人民币（汇率假设）','30天系数','90天系数','180天系数','360天系数']);
adsSheet.getRange('A4:B11').values = adsBase;
for (let i=0;i<adsBase.length;i++) adsSheet.getRange(`C${i+4}`).formulas = [[`=B${i+4}*'假设与图例'!$B$4`]];
adsSheet.getRange('D4:G11').values = adsBase.map(()=>[1,0.9,0.85,0.8]);
adsSheet.getRange('A4:G11').format = { borders:{insideHorizontal:{style:'thin',color:'#E6E9ED'}}, verticalAlignment:'center' };
adsSheet.getRange('B4:B11').format.numberFormat = '"$"#,##0.00';
adsSheet.getRange('C4:C11').format.numberFormat = '"¥"#,##0.00';
adsSheet.getRange('D4:G11').format.numberFormat = '0%';
adsSheet.getRange('A13:G13').merge(); adsSheet.getRange('A13').values=[['计价公式：按区间累进计价；例如200环境=10×$0.90+90×$0.30+100×$0.25=$61/月。表内不含额外成员费、支付手续费或优惠券。']];
adsSheet.getRange('A13:G13').format={fill:colors.yellow,wrapText:true};
widths(adsSheet,{A:14,B:24,C:24,D:14,E:14,F:14,G:14}); adsSheet.freezePanes.freezeRows(3);

title(yunSheet, 'A1:F1', 'YunLogin 浏览器套餐价格矩阵');
header(yunSheet, 'A3:F3', ['环境数','原始月价（CNY）','30天应付','90天应付','180天应付','360天应付']);
yunSheet.getRange('A4:F11').values = yunBase;
yunSheet.getRange('B4:F11').format.numberFormat = '"¥"#,##0.00';
yunSheet.getRange('A4:F11').format.borders={insideHorizontal:{style:'thin',color:'#E6E9ED'}};
yunSheet.getRange('A13:F13').merge(); yunSheet.getRange('A13').values=[['价格含当期限时折扣：30/90/180/360天对应0.85/0.8/0.75/0.5；不含额外成员、现套餐抵扣和优惠券。50环境90天为按已确认月价计算值。']];
yunSheet.getRange('A13:F13').format={fill:colors.yellow,wrapText:true};
widths(yunSheet,{A:14,B:22,C:20,D:20,E:20,F:20}); yunSheet.freezePanes.freezeRows(3);

title(matrix, 'A1:L1', '同环境数、同周期浏览器套餐金额敏感性比较');
matrix.getRange('A2:L2').merge(); matrix.getRange('A2').values=[['仅比较环境商品金额：AdsPower按USD计价并用可编辑分析汇率折算；不含双方成员费、AdsPower支付手续费、优惠券、现套餐抵扣和功能权益差异。结果不是实时成交价。']];
matrix.getRange('A2:L2').format={fill:colors.yellow,wrapText:true,font:{italic:true,color:'#7F6000'}};
header(matrix,'A3:L3',['环境数','周期（天）','Ads月基价USD','Ads周期折扣','Ads总价USD','Ads折算CNY','Yun原始月价CNY','Yun周期折扣','Yun总价CNY','Yun-Ads差额CNY','Yun/Ads','分析结论']);
const matrixRows=[];
for(let e=0;e<adsBase.length;e++) for(let p=0;p<periods.length;p++) matrixRows.push([adsBase[e][0],periods[p][0]]);
matrix.getRange(`A4:B${matrixRows.length+3}`).values=matrixRows;
let row=4;
for(let e=0;e<adsBase.length;e++){
  const adsRow=e+4, yunRow=e+4;
  for(let p=0;p<periods.length;p++,row++){
    const [days,adsDisc,yunDisc,yunCol]=periods[p];
    const yunLetter=['A','B','C','D','E','F'][yunCol-1];
    matrix.getRange(`C${row}`).formulas=[[`='AdsPower套餐基价'!B${adsRow}`]];
    matrix.getRange(`D${row}`).values=[[adsDisc]];
    matrix.getRange(`E${row}`).formulas=[[`=C${row}*(B${row}/30)*D${row}`]];
    matrix.getRange(`F${row}`).formulas=[[`=E${row}*'假设与图例'!$B$4`]];
    matrix.getRange(`G${row}`).formulas=[[`='YunLogin套餐价格'!B${yunRow}`]];
    matrix.getRange(`H${row}`).values=[[yunDisc]];
    matrix.getRange(`I${row}`).formulas=[[`='YunLogin套餐价格'!${yunLetter}${yunRow}`]];
    matrix.getRange(`J${row}`).formulas=[[`=I${row}-F${row}`]];
    matrix.getRange(`K${row}`).formulas=[[`=I${row}/F${row}`]];
    matrix.getRange(`L${row}`).formulas=[[`=IF(K${row}<0.8,"Yun页面金额明显较低",IF(K${row}>1.2,"Ads折算金额明显较低","金额接近；需比较权益"))`]];
  }
}
matrix.getRange(`A4:L${matrixRows.length+3}`).format={borders:{insideHorizontal:{style:'thin',color:'#E6E9ED'}},verticalAlignment:'center'};
matrix.getRange(`C4:C${matrixRows.length+3}`).format.numberFormat='"$"#,##0.00';
matrix.getRange(`D4:D${matrixRows.length+3}`).format.numberFormat='0%';
matrix.getRange(`E4:E${matrixRows.length+3}`).format.numberFormat='"$"#,##0.00';
matrix.getRange(`F4:J${matrixRows.length+3}`).format.numberFormat='"¥"#,##0.00';
matrix.getRange(`H4:H${matrixRows.length+3}`).format.numberFormat='0%';
matrix.getRange(`K4:K${matrixRows.length+3}`).format.numberFormat='0.00x';
matrix.freezePanes.freezeRows(3); matrix.freezePanes.freezeColumns(2);
widths(matrix,{A:12,B:12,C:18,D:15,E:18,F:18,G:20,H:15,I:18,J:19,K:12,L:26});
const matrixTable=matrix.tables.add(`A3:L${matrixRows.length+3}`,true,'PackageAmountComparison'); matrixTable.style='TableStyleMedium2';

title(proxy,'A1:G1','代理与增值商品价格口径对比');
header(proxy,'A3:G3',['商品类型','产品','价格区间/示例','有效期/周期','折扣或定制','可比性说明','来源']);
proxy.getRange(`A4:G${proxyRows.length+3}`).values=proxyRows;
proxy.getRange(`A4:G${proxyRows.length+3}`).format={wrapText:true,verticalAlignment:'top',borders:{insideHorizontal:{style:'thin',color:'#E6E9ED'}}};
proxy.getRange('A10:G10').merge(); proxy.getRange('A10').values=[['重要：两家代理不是同一供应商、同一线路、同一城市颗粒度或同一质量等级。汇率折算后金额仍不构成等质价格比较，应补充IP纯净度、可用率、成功率、售后与库存。']];
proxy.getRange('A10:G10').format={fill:colors.yellow,wrapText:true,font:{bold:true,color:'#7F6000'}};
widths(proxy,{A:26,B:14,C:30,D:18,E:36,F:48,G:38}); proxy.freezePanes.freezeRows(3);

title(legend,'A1:D1','假设、颜色图例与计算边界');
header(legend,'A3:D3',['项目','值/颜色','定义','使用限制']);
legend.getRange('A4:D4').values=[['USD/CNY分析汇率',fx,'用于套餐金额敏感性折算','非实时汇率；可编辑后查看公式结果']];
legend.getRange('B4').format.numberFormat='0.00';
const legendRows=[
  ['红色',colors.red,'AdsPower有、YunLogin明确没有','必须有YunLogin明确不存在或不支持的证据'],
  ['黄色',colors.yellow,'AdsPower有、YunLogin材料未覆盖','先补材料或实测，禁止直接视为缺失'],
  ['绿色',colors.green,'双方核心价格模式一致','仍需比较具体规则和体验'],
  ['蓝色',colors.blue,'双方均有但价格/套餐模式不同','差异不自动等于优劣'],
  ['灰色',colors.gray,'仅单边确认、不可等质比较或双方均不完整','不纳入确定竞品缺口'],
];
legend.getRange('A6:D10').values=legendRows;
for(let i=0;i<legendRows.length;i++) legend.getRange(`A${i+6}:D${i+6}`).format.fill=legendRows[i][1];
legend.getRange('B6:B10').values=[['红色'],['黄色'],['绿色'],['蓝色'],['灰色']];
legend.getRange('A12:D12').values=[['比较边界','处理方式','原因','决策建议']]; legend.getRange('A12:D12').format={fill:colors.navy,font:{bold:true,color:colors.white}};
legend.getRange('A13:D17').values=[
  ['币种','保留原币，并提供可编辑汇率敏感性','汇率随时间变化','不要把折算结果当实时报价'],
  ['代理资源','只比较模式和公开区间，不直接排序贵贱','供应商、质量、地区、协议和SLA不同','建立等质样本后再比TCO'],
  ['促销价格','标记活动和截止日期','短期折扣不等于常规价格','到期后重新核实'],
  ['手续费','单独列示，不混入商品基价','渠道和地区可能不同','结算页验证最终应付'],
  ['功能权益','套餐金额表不调整权益差异','两家套餐所含能力不完全相同','金额与功能覆盖表联合决策'],
];
legend.getRange('A3:D17').format={wrapText:true,borders:{preset:'all',style:'thin',color:colors.border},verticalAlignment:'top'};
widths(legend,{A:24,B:24,C:48,D:52});

const counts = Object.fromEntries(['红色','黄色','绿色','蓝色','灰色'].map(c=>[c,modes.filter(r=>r[5]===c).length]));
title(dash,'A1:H1','YunLogin 与 AdsPower 产品价格对比看板');
header(dash,'A3:B3',['指标','数量']);
dash.getRange('A4:B9').values=[['价格/套餐模式对比项',modes.length],['红色：明确缺失',counts['红色']],['黄色：待确认',counts['黄色']],['绿色：核心一致',counts['绿色']],['蓝色：模式不同',counts['蓝色']],['灰色：不可直接比较',counts['灰色']]];
for(let i=0;i<5;i++) dash.getRange(`A${i+5}:B${i+5}`).format.fill=[colors.red,colors.yellow,colors.green,colors.blue,colors.gray][i];
header(dash,'D3:H3',['结论层级','核心结论','影响','优先级','注意']);
dash.getRange('D4:H9').values=[
  ['套餐架构','AdsPower形成免费/试用/专业/商业/企业/终身环境的多层价格梯度；YunLogin以统一环境套餐和深周期折扣为主','覆盖从低门槛到大客户的完整度不同','P0','企业档为唯一明确缺失；其他未覆盖模式不能直接判无'],
  ['同档金额','按7.20分析汇率，当前样本中YunLogin同环境数页面金额显著低于AdsPower折算金额','有利于价格吸引力，但不代表功能权益和服务等价','P1','汇率和活动价可变，需做敏感性分析'],
  ['规模计价','AdsPower公开累进阶梯，规模越大边际环境单价越低；YunLogin完整定价函数未披露','影响报价透明度、销售解释和大客户预算','P0','先补齐函数，不把样例外推为规则'],
  ['代理商业化','双方均卖静态代理；AdsPower另有动态住宅流量包，YunLogin有家庭住宅首月免费和购物车','交叉销售方式和供应结构不同','P1','代理不等质，不能只按金额排名'],
  ['支付全球化','AdsPower多币种、多本地支付，但常见2%+$1手续费；YunLogin以人民币云币、支付宝和微信为主','目标市场和支付成功率不同','P1','手续费模式在YunLogin仅属待确认'],
  ['增值收入','AdsPower确认终身环境和付费RPA模板；YunLogin材料未覆盖同类价格','AdsPower收入结构更分散','P1/P2','先验证需求与订阅蚕食，不建议机械复制'],
];
dash.getRange('A3:H9').format={wrapText:true,verticalAlignment:'top',borders:{insideHorizontal:{style:'thin',color:'#E6E9ED'}}};
dash.getRange('A11:H11').merge(); dash.getRange('A11').values=[['严格事实结论：红色只有企业套餐与询价模式。免费/试用、终身环境、动态住宅流量包、付费模板和手续费均因YunLogin材料无直接证据而标黄色，不等于已确认不存在。']];
dash.getRange('A11:H11').format={fill:colors.red,wrapText:true,font:{bold:true,color:'#9C0006'}};
widths(dash,{A:28,B:14,C:5,D:18,E:58,F:40,G:12,H:46}); dash.freezePanes.freezeRows(3);

for (const sh of [dash,mode,matrix,adsSheet,yunSheet,proxy,legend]) {
  const used = sh.getUsedRange();
  if (used) used.format.font = { name: 'Arial', size: 10 };
}

const outFile = path.join(outDir,'YunLogin与AdsPower产品价格对比表.xlsx');
const exported = await SpreadsheetFile.exportXlsx(workbook); await exported.save(outFile);

const previews = path.join(outDir,'previews'); await fs.mkdir(previews,{recursive:true});
for (const sh of [dash,mode,matrix,adsSheet,yunSheet,proxy,legend]) {
  const blob = await workbook.render({sheetName:sh.name,autoCrop:'all',scale:1,format:'png'});
  await fs.writeFile(path.join(previews,`${sh.name}.png`),new Uint8Array(await blob.arrayBuffer()));
}
const inspect = await workbook.inspect({kind:'table',sheetId:'价格对比看板',range:'A1:H11',include:'values,formulas',tableMaxRows:15,tableMaxCols:10,maxChars:12000});
const formulaScan = await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:200},summary:'final formula error scan'});
await fs.writeFile(path.join(outDir,'verification.txt'),`${inspect.ndjson}\n${formulaScan.ndjson}\n`);
console.log(JSON.stringify({output:outFile,modeCount:modes.length,counts,matrixRows:matrixRows.length,inspect:inspect.ndjson,errorScan:formulaScan.ndjson},null,2));
