import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async createClientRequest(dto: CreateRequestDto) {
    return this.prisma.clientRequest.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        clientType: dto.clientType,
        monthlyConsumption: dto.monthlyConsumption,
        householdSize: dto.householdSize,
        energyUsagePattern: dto.energyUsagePattern,
        appliances: dto.appliances,
        roofArea: dto.roofArea,
        roofType: dto.roofType,
        location: dto.location,
        peakSunHours: dto.peakSunHours,
        hasShading: dto.hasShading,
        budget: dto.budget,
      },
    });
  }

  async listClientRequests() {
    return this.prisma.clientRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }
}

