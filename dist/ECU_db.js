"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _0000_json_1 = __importDefault(require("./ECU.d/0000.json"));
const _85ff_json_1 = __importDefault(require("./ECU.d/85ff.json"));
const ankai_json_1 = __importDefault(require("./ECU.d/ankai.json"));
const btp_foton_json_1 = __importDefault(require("./ECU.d/btp_foton.json"));
const btt_foton_json_1 = __importDefault(require("./ECU.d/btt_foton.json"));
const btv_foton_json_1 = __importDefault(require("./ECU.d/btv_foton.json"));
const d000_json_1 = __importDefault(require("./ECU.d/d000.json"));
const d200_json_1 = __importDefault(require("./ECU.d/d200.json"));
const daimler_json_1 = __importDefault(require("./ECU.d/daimler.json"));
const dongfeng_j1939_json_1 = __importDefault(require("./ECU.d/dongfeng.j1939.json"));
const e000_json_1 = __importDefault(require("./ECU.d/e000.json"));
const e0ff_json_1 = __importDefault(require("./ECU.d/e0ff.json"));
const f000_json_1 = __importDefault(require("./ECU.d/f000.json"));
const f001_json_1 = __importDefault(require("./ECU.d/f001.json"));
const f003_json_1 = __importDefault(require("./ECU.d/f003.json"));
const f004_json_1 = __importDefault(require("./ECU.d/f004.json"));
const f005_json_1 = __importDefault(require("./ECU.d/f005.json"));
const f006_json_1 = __importDefault(require("./ECU.d/f006.json"));
const f008_json_1 = __importDefault(require("./ECU.d/f008.json"));
const f009_json_1 = __importDefault(require("./ECU.d/f009.json"));
const f00a_json_1 = __importDefault(require("./ECU.d/f00a.json"));
const f00e_json_1 = __importDefault(require("./ECU.d/f00e.json"));
const f00f_json_1 = __importDefault(require("./ECU.d/f00f.json"));
const fc96_json_1 = __importDefault(require("./ECU.d/fc96.json"));
const fca0_json_1 = __importDefault(require("./ECU.d/fca0.json"));
const fcb7_json_1 = __importDefault(require("./ECU.d/fcb7.json"));
const fcdc_json_1 = __importDefault(require("./ECU.d/fcdc.json"));
const fce7_json_1 = __importDefault(require("./ECU.d/fce7.json"));
const fcfd_json_1 = __importDefault(require("./ECU.d/fcfd.json"));
const fd07_json_1 = __importDefault(require("./ECU.d/fd07.json"));
const fd09_json_1 = __importDefault(require("./ECU.d/fd09.json"));
const fd20_json_1 = __importDefault(require("./ECU.d/fd20.json"));
const fd3e_json_1 = __importDefault(require("./ECU.d/fd3e.json"));
const fd7b_json_1 = __importDefault(require("./ECU.d/fd7b.json"));
const fd7c_json_1 = __importDefault(require("./ECU.d/fd7c.json"));
const fd8c_json_1 = __importDefault(require("./ECU.d/fd8c.json"));
const fd92_json_1 = __importDefault(require("./ECU.d/fd92.json"));
const fd94_json_1 = __importDefault(require("./ECU.d/fd94.json"));
const fd9f_json_1 = __importDefault(require("./ECU.d/fd9f.json"));
const fda3_json_1 = __importDefault(require("./ECU.d/fda3.json"));
const fda4_json_1 = __importDefault(require("./ECU.d/fda4.json"));
const fda5_json_1 = __importDefault(require("./ECU.d/fda5.json"));
const fdb2_json_1 = __importDefault(require("./ECU.d/fdb2.json"));
const fdb3_json_1 = __importDefault(require("./ECU.d/fdb3.json"));
const fdb4_json_1 = __importDefault(require("./ECU.d/fdb4.json"));
const fdc2_json_1 = __importDefault(require("./ECU.d/fdc2.json"));
const fdc6_json_1 = __importDefault(require("./ECU.d/fdc6.json"));
const fdcd_json_1 = __importDefault(require("./ECU.d/fdcd.json"));
const fdd1_json_1 = __importDefault(require("./ECU.d/fdd1.json"));
const fdd5_json_1 = __importDefault(require("./ECU.d/fdd5.json"));
const fde4_json_1 = __importDefault(require("./ECU.d/fde4.json"));
const fde8_json_1 = __importDefault(require("./ECU.d/fde8.json"));
const fde9_json_1 = __importDefault(require("./ECU.d/fde9.json"));
const fdeb_json_1 = __importDefault(require("./ECU.d/fdeb.json"));
const fe40_json_1 = __importDefault(require("./ECU.d/fe40.json"));
const fe41_json_1 = __importDefault(require("./ECU.d/fe41.json"));
const fe4d_json_1 = __importDefault(require("./ECU.d/fe4d.json"));
const fe4e_json_1 = __importDefault(require("./ECU.d/fe4e.json"));
const fe52_json_1 = __importDefault(require("./ECU.d/fe52.json"));
const fe55_json_1 = __importDefault(require("./ECU.d/fe55.json"));
const fe56_json_1 = __importDefault(require("./ECU.d/fe56.json"));
const fe58_json_1 = __importDefault(require("./ECU.d/fe58.json"));
const fe5a_json_1 = __importDefault(require("./ECU.d/fe5a.json"));
const fe68_json_1 = __importDefault(require("./ECU.d/fe68.json"));
const fe69_json_1 = __importDefault(require("./ECU.d/fe69.json"));
const fe6c_json_1 = __importDefault(require("./ECU.d/fe6c.json"));
const fe6d_json_1 = __importDefault(require("./ECU.d/fe6d.json"));
const fe70_json_1 = __importDefault(require("./ECU.d/fe70.json"));
const fe92_json_1 = __importDefault(require("./ECU.d/fe92.json"));
const fe99_json_1 = __importDefault(require("./ECU.d/fe99.json"));
const fe9a_json_1 = __importDefault(require("./ECU.d/fe9a.json"));
const fea4_json_1 = __importDefault(require("./ECU.d/fea4.json"));
const feac_json_1 = __importDefault(require("./ECU.d/feac.json"));
const feae_json_1 = __importDefault(require("./ECU.d/feae.json"));
const feaf_json_1 = __importDefault(require("./ECU.d/feaf.json"));
const feb1_json_1 = __importDefault(require("./ECU.d/feb1.json"));
const feb2_json_1 = __importDefault(require("./ECU.d/feb2.json"));
const feb3_json_1 = __importDefault(require("./ECU.d/feb3.json"));
const feb6_json_1 = __importDefault(require("./ECU.d/feb6.json"));
const febd_json_1 = __importDefault(require("./ECU.d/febd.json"));
const febe_json_1 = __importDefault(require("./ECU.d/febe.json"));
const febf_json_1 = __importDefault(require("./ECU.d/febf.json"));
const fec0_json_1 = __importDefault(require("./ECU.d/fec0.json"));
const fec1_json_1 = __importDefault(require("./ECU.d/fec1.json"));
const fec3_json_1 = __importDefault(require("./ECU.d/fec3.json"));
const feca_json_1 = __importDefault(require("./ECU.d/feca.json"));
const fed5_json_1 = __importDefault(require("./ECU.d/fed5.json"));
const fed9_json_1 = __importDefault(require("./ECU.d/fed9.json"));
const fedb_json_1 = __importDefault(require("./ECU.d/fedb.json"));
const fedc_json_1 = __importDefault(require("./ECU.d/fedc.json"));
const fedd_json_1 = __importDefault(require("./ECU.d/fedd.json"));
const fedf_json_1 = __importDefault(require("./ECU.d/fedf.json"));
const fee0_json_1 = __importDefault(require("./ECU.d/fee0.json"));
const fee2_json_1 = __importDefault(require("./ECU.d/fee2.json"));
const fee3_json_1 = __importDefault(require("./ECU.d/fee3.json"));
const fee4_json_1 = __importDefault(require("./ECU.d/fee4.json"));
const fee5_json_1 = __importDefault(require("./ECU.d/fee5.json"));
const fee6_json_1 = __importDefault(require("./ECU.d/fee6.json"));
const fee7_json_1 = __importDefault(require("./ECU.d/fee7.json"));
const fee8_json_1 = __importDefault(require("./ECU.d/fee8.json"));
const fee9_json_1 = __importDefault(require("./ECU.d/fee9.json"));
const feea_json_1 = __importDefault(require("./ECU.d/feea.json"));
const feee_json_1 = __importDefault(require("./ECU.d/feee.json"));
const feef_json_1 = __importDefault(require("./ECU.d/feef.json"));
const fef0_json_1 = __importDefault(require("./ECU.d/fef0.json"));
const fef1_json_1 = __importDefault(require("./ECU.d/fef1.json"));
const fef2_json_1 = __importDefault(require("./ECU.d/fef2.json"));
const fef3_json_1 = __importDefault(require("./ECU.d/fef3.json"));
const fef4_json_1 = __importDefault(require("./ECU.d/fef4.json"));
const fef5_json_1 = __importDefault(require("./ECU.d/fef5.json"));
const fef6_json_1 = __importDefault(require("./ECU.d/fef6.json"));
const fef7_json_1 = __importDefault(require("./ECU.d/fef7.json"));
const fef8_json_1 = __importDefault(require("./ECU.d/fef8.json"));
const fefa_json_1 = __importDefault(require("./ECU.d/fefa.json"));
const fefc_json_1 = __importDefault(require("./ECU.d/fefc.json"));
const fefd_json_1 = __importDefault(require("./ECU.d/fefd.json"));
const feff_json_1 = __importDefault(require("./ECU.d/feff.json"));
const foton_j1939_json_1 = __importDefault(require("./ECU.d/foton.j1939.json"));
const jac_json_1 = __importDefault(require("./ECU.d/jac.json"));
const jmc_json_1 = __importDefault(require("./ECU.d/jmc.json"));
const maxus_json_1 = __importDefault(require("./ECU.d/maxus.json"));
const mobileye_json_1 = __importDefault(require("./ECU.d/mobileye.json"));
const movon_json_1 = __importDefault(require("./ECU.d/movon.json"));
const yuton_json_1 = __importDefault(require("./ECU.d/yuton.json"));
const yutong_j1939_json_1 = __importDefault(require("./ECU.d/yutong.j1939.json"));
const obd2_json_1 = __importDefault(require("./ECU.d/obd2.json"));
exports.default = {
    ..._0000_json_1.default,
    ..._85ff_json_1.default,
    ...ankai_json_1.default,
    ...btp_foton_json_1.default,
    ...btt_foton_json_1.default,
    ...btv_foton_json_1.default,
    ...d000_json_1.default,
    ...d200_json_1.default,
    ...daimler_json_1.default,
    ...dongfeng_j1939_json_1.default,
    ...e000_json_1.default,
    ...e0ff_json_1.default,
    ...f000_json_1.default,
    ...f001_json_1.default,
    ...f003_json_1.default,
    ...f004_json_1.default,
    ...f005_json_1.default,
    ...f006_json_1.default,
    ...f008_json_1.default,
    ...f009_json_1.default,
    ...f00a_json_1.default,
    ...f00e_json_1.default,
    ...f00f_json_1.default,
    ...fc96_json_1.default,
    ...fca0_json_1.default,
    ...fcb7_json_1.default,
    ...fcdc_json_1.default,
    ...fce7_json_1.default,
    ...fcfd_json_1.default,
    ...fd07_json_1.default,
    ...fd09_json_1.default,
    ...fd20_json_1.default,
    ...fd3e_json_1.default,
    ...fd7b_json_1.default,
    ...fd7c_json_1.default,
    ...fd8c_json_1.default,
    ...fd92_json_1.default,
    ...fd94_json_1.default,
    ...fd9f_json_1.default,
    ...fda3_json_1.default,
    ...fda4_json_1.default,
    ...fda5_json_1.default,
    ...fdb2_json_1.default,
    ...fdb3_json_1.default,
    ...fdb4_json_1.default,
    ...fdc2_json_1.default,
    ...fdc6_json_1.default,
    ...fdcd_json_1.default,
    ...fdd1_json_1.default,
    ...fdd5_json_1.default,
    ...fde4_json_1.default,
    ...fde8_json_1.default,
    ...fde9_json_1.default,
    ...fdeb_json_1.default,
    ...fe40_json_1.default,
    ...fe41_json_1.default,
    ...fe4d_json_1.default,
    ...fe4e_json_1.default,
    ...fe52_json_1.default,
    ...fe55_json_1.default,
    ...fe56_json_1.default,
    ...fe58_json_1.default,
    ...fe5a_json_1.default,
    ...fe68_json_1.default,
    ...fe69_json_1.default,
    ...fe6c_json_1.default,
    ...fe6d_json_1.default,
    ...fe70_json_1.default,
    ...fe92_json_1.default,
    ...fe99_json_1.default,
    ...fe9a_json_1.default,
    ...fea4_json_1.default,
    ...feac_json_1.default,
    ...feae_json_1.default,
    ...feaf_json_1.default,
    ...feb1_json_1.default,
    ...feb2_json_1.default,
    ...feb3_json_1.default,
    ...feb6_json_1.default,
    ...febd_json_1.default,
    ...febe_json_1.default,
    ...febf_json_1.default,
    ...fec0_json_1.default,
    ...fec1_json_1.default,
    ...fec3_json_1.default,
    ...feca_json_1.default,
    ...fed5_json_1.default,
    ...fed9_json_1.default,
    ...fedb_json_1.default,
    ...fedc_json_1.default,
    ...fedd_json_1.default,
    ...fedf_json_1.default,
    ...fee0_json_1.default,
    ...fee2_json_1.default,
    ...fee3_json_1.default,
    ...fee4_json_1.default,
    ...fee5_json_1.default,
    ...fee6_json_1.default,
    ...fee7_json_1.default,
    ...fee8_json_1.default,
    ...fee9_json_1.default,
    ...feea_json_1.default,
    ...feee_json_1.default,
    ...feef_json_1.default,
    ...fef0_json_1.default,
    ...fef1_json_1.default,
    ...fef2_json_1.default,
    ...fef3_json_1.default,
    ...fef4_json_1.default,
    ...fef5_json_1.default,
    ...fef6_json_1.default,
    ...fef7_json_1.default,
    ...fef8_json_1.default,
    ...fefa_json_1.default,
    ...fefc_json_1.default,
    ...fefd_json_1.default,
    ...feff_json_1.default,
    ...foton_j1939_json_1.default,
    ...jac_json_1.default,
    ...jmc_json_1.default,
    ...maxus_json_1.default,
    ...mobileye_json_1.default,
    ...movon_json_1.default,
    ...yuton_json_1.default,
    ...yutong_j1939_json_1.default,
    ...obd2_json_1.default,
};
