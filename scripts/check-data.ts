import {validateContent} from '../src/validate-content';
const errors=validateContent();if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Dữ liệu hợp lệ: ID, liên kết, công thức, nguồn vật phẩm và điều kiện nhiệm vụ.');
