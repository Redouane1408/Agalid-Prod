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
        price: 1800,
        categoryId: catMap.get('Panneaux Solaires'),
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800',
        specs: { power: '550W', efficiency: '21.5%', type: 'Monocristallin' }
      },
      {
        name: 'Longi Solar 450W',
        description: 'Module photovoltaïque fiable avec technologie Half-Cut pour une meilleure performance à l\'ombre.',
        price: 1450,
        categoryId: catMap.get('Panneaux Solaires'),
        image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=800',
        specs: { power: '450W', efficiency: '20.9%', type: 'Monocristallin' }
      },
      {
        name: 'Enphase IQ8M Micro-inverter',
        description: 'Micro-onduleur de dernière génération, prêt pour le réseau intelligent. Garantie 25 ans.',
        price: 1600,
        categoryId: catMap.get('Onduleurs'),
        image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=800',
        specs: { power: '330VA', type: 'Micro-onduleur', warranty: '25 ans' }
      },
      {
        name: 'Growatt 5kW Hybride',
        description: 'Onduleur hybride monophasé pour stockage d\'énergie. Interface conviviale et surveillance WiFi incluse.',
        price: 8500,
        categoryId: catMap.get('Onduleurs'),
        image: 'https://images.unsplash.com/photo-1592833159057-65a2845730ce?auto=format&fit=crop&q=80&w=800',
        specs: { power: '5kW', type: 'Hybride', phases: 'Monophasé' }
      },
      {
        name: 'Tesla Powerwall 2',
        description: 'Batterie domestique AC tout-en-un. Stockez l\'énergie solaire pour une utilisation nocturne ou de secours.',
        price: 85000,
        categoryId: catMap.get('Batteries'),
        image: 'https://images.unsplash.com/photo-1569024733983-25f60f6158ab?auto=format&fit=crop&q=80&w=800',
        specs: { capacity: '13.5kWh', power: '5kW', technology: 'Li-ion' }
      },
      {
        name: 'Pylontech US3000C',
        description: 'Module de batterie Lithium-ion 3.5kWh, évolutif et compatible avec la plupart des onduleurs hybrides.',
        price: 12500,
        categoryId: catMap.get('Batteries'),
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
        specs: { capacity: '3.5kWh', voltage: '48V', cycles: '>6000' }
      },
      {
        name: 'Kit Solaire Autonome 3kW',
        description: 'Kit complet pour sites isolés : 6 panneaux 500W, onduleur 3kW, 2 batteries 2.4kWh et accessoires.',
        price: 35000,
        categoryId: catMap.get('Kits Solaires'),
        image: 'https://images.unsplash.com/photo-1548613053-22002dd9c758?auto=format&fit=crop&q=80&w=800',
        specs: { power: '3kW', autonomy: 'Oui', storage: '4.8kWh' }
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
