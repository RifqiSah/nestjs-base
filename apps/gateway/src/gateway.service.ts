import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Keyword } from '../entities/keyword.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GatewayService {
  constructor(
    @InjectRepository(Keyword)
    private readonly keywordRepo: Repository<Keyword>,
  ) {}

  async getHello() {
    return this.keywordRepo.find({
      take: 5,
    });
  }
}
