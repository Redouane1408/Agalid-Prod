import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Prisma } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    const where: Prisma.ProductWhereInput = {};
    
    if (category && category !== 'All') {
      where.category = { name: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.productsService.findAll({ where });
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { categoryId, specs, ...rest } = createProductDto;
    const data: Prisma.ProductCreateInput = {
      ...rest,
      ...(typeof specs !== 'undefined' ? { specs: specs as Prisma.InputJsonValue } : {}),
      category: { connect: { id: categoryId } },
    };
    return this.productsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const { categoryId, specs, ...rest } = updateProductDto;
    const data: Prisma.ProductUpdateInput = { 
      ...rest,
      ...(typeof specs !== 'undefined' ? { specs: specs as Prisma.InputJsonValue } : {}),
    };
    if (categoryId) {
      data.category = { connect: { id: categoryId } };
    }
    return this.productsService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
