import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OssEntity } from '@/modules/oss/oss.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OssService {
  constructor(
    @InjectRepository(OssEntity)
    private readonly ossRepository: Repository<OssEntity>,
  ) {}

  async save(oss: Partial<OssEntity>) {
    return await this.ossRepository.save(oss);
  }
}
