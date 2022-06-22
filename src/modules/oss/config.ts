import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as multer from 'multer';
import * as dayjs from 'dayjs';
import * as fs from 'fs';

export const multerConfig = (config: ConfigService) => {
  // 允许上传的文件大小
  const fileLimit = config.get('FILE_SIZE_LIMIT') * 1024 * 1024;
  // 允许上传的文件类型
  const fileTypeLimit = config
    .get<string>('FILE_TYPE_LIMIT')
    .split(',')
    .filter(Boolean);
  return {
    limits: {
      fileSize: fileLimit,
    },
    fileFilter: (req, file, callback) => {
      if (fileTypeLimit.length === 0) {
        // 文件类型不做限制
        callback(null, true);
      }
      if (fileTypeLimit.some((item) => file.mimetype.includes(item))) {
        // 允许存储文件
        callback(null, true);
      } else {
        const extname = path.extname(file.originalname);
        // 拒绝文件上传
        callback(new Error(`不支持 ${extname} 格式文件上传`), false);
      }
    },
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // 文件前缀
        const baseDir = path.resolve(config.get<string>('UPLOAD_PATH'));
        const { service = 'other' } = req.body;
        // 保存文件夹
        const saveDirPrefix = `${service}/${dayjs().format('YYYYMM')}`;
        const saveDir = path.join(baseDir, saveDirPrefix);

        // 没有则创建
        if (!fs.existsSync(saveDir)) {
          fs.mkdirSync(saveDir, { recursive: true });
        }

        cb(null, saveDir);
      },
      filename: (req, file, cb) => {
        const { originalname } = file;
        // 文件名称前缀
        const prefix = dayjs().format('DDHHmmss-');
        // 文件扩展名
        const ext = path.extname(originalname);
        // 存储文件完整路径
        cb(null, `${prefix}${nanoid(12)}${ext}`);
      },
    }),
  };
};
