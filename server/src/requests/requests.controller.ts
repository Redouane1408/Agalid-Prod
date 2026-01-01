import { Body, Controller, Get, Post } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() dto: CreateRequestDto) {
    const result = await this.requestsService.createClientRequest(dto);
    return { id: result.id };
  }

  @Get()
  async list() {
    return this.requestsService.listClientRequests();
  }
}

