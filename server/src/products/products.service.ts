import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.product.count();
    if (count === 0) {
      this.logger.log('Seeding initial products...');
      await this.seedProducts();
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { category: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
  }

  async create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: { category: true },
    });
  }

  async update(id: number, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  private async seedProducts() {
    const categories = [
      { name: 'Panneaux Solaires' },
      { name: 'Onduleurs' },
      { name: 'Batteries' },
      { name: 'Kits Solaires' },
      { name: 'Accessoires' }
    ];

    for (const cat of categories) {
      await this.prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }

    const cats = await this.prisma.category.findMany();
    const catMap = new Map(cats.map(c => [c.name, c.id]));

    const products = [
      {
        name: 'JA Solar 550W Mono PERC',
        description: 'Panneau solaire monocristallin haute efficacité. Idéal pour les installations résidentielles et commerciales.',
        price: 35000,
        categoryId: catMap.get('Panneaux Solaires'),
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800',
        specs: { power: '550W', efficiency: '21.5%', type: 'Monocristallin' }
      },
      {
        name: 'Longi Solar 450W Hi-MO 4',
        description: 'Panneau solaire robuste et performant, technologie Half-Cut pour une meilleure tolérance à l\'ombre.',
        price: 28000,
        categoryId: catMap.get('Panneaux Solaires'),
        image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=800',
        specs: { power: '450W', efficiency: '20.9%', type: 'Monocristallin' }
      },
      {
        name: 'Huawei SUN2000-5KTL',
        description: 'Onduleur hybride intelligent 5kW, compatible avec batteries. Monitoring via application mobile.',
        price: 150000,
        categoryId: catMap.get('Onduleurs'),
        image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=800',
        specs: { power: '5kW', phase: 'Monophasé', efficiency: '98.4%' }
      },
      {
        name: 'Growatt 5000ES',
        description: 'Onduleur off-grid 5kW, idéal pour les sites isolés. Contrôleur de charge MPPT intégré.',
        price: 120000,
        categoryId: catMap.get('Onduleurs'),
        image: 'https://images.unsplash.com/photo-1592833159057-65a269f53afa?auto=format&fit=crop&q=80&w=800',
        specs: { power: '5kW', type: 'Off-Grid', mppt: 'Yes' }
      },
      {
        name: 'Pylontech US3000C',
        description: 'Batterie Lithium LiFePO4 3.5kWh. Modulaire et sécurisée, garantie 10 ans.',
        price: 240000,
        categoryId: catMap.get('Batteries'),
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
        specs: { capacity: '3.5kWh', voltage: '48V', technology: 'LiFePO4' }
      },
      {
        name: 'Kit Solaire Autonome 3kW',
        description: 'Kit complet pour maison isolée : 6 panneaux, onduleur 3kW, 2 batteries 2.4kWh.',
        price: 550000,
        categoryId: catMap.get('Kits Solaires'),
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf2ef70?auto=format&fit=crop&q=80&w=800',
        specs: { power: '3kW', storage: '4.8kWh', type: 'Autonome' }
      }
    ];

    for (const p of products) {
      if (p.categoryId) {
        await this.prisma.product.create({
          data: {
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            categoryId: p.categoryId,
            stock: 10 + Math.floor(Math.random() * 50),
            specs: p.specs
          }
        });
      }
    }
    this.logger.log('Seeding completed.');
  }
}
