import mongoose from 'mongoose'
import { config } from '../apps/api/src/config.js'
import { List } from '../apps/api/src/models/list.js'
import { Dish } from '../apps/api/src/models/dish.js'

const userId = '6a94a05a7e0b1c75dce17301'

const dishes = [
  {
    name: 'Strogonoff de Frango',
    description: 'Cubos de frango ao molho cremoso de cogumelos, acompanhados de arroz e batata palha.',
    tags: ['brasileira', 'ave', 'cremoso'],
    isQuick: true,
    yieldsLeftovers: false,
  },
  {
    name: 'Massa ao Alho e Óleo',
    description: 'Macarrão salteado no alho, óleo e pimenta, finalizado com salsinha.',
    tags: ['italiana', 'massa', 'vegetariano'],
    isQuick: true,
    yieldsLeftovers: false,
  },
  {
    name: 'Risoto de Cogumelos',
    description: 'Arroz arbóreo cremoso com cogumelos, queijo parmesão e vinho branco.',
    tags: ['italiana', 'massa', 'vegetariano'],
    isQuick: false,
    yieldsLeftovers: false,
  },
  {
    name: 'Pastel de Carne',
    description: 'Pastel crocante recheado com carne moída temperada.',
    tags: ['lanche', 'carne', 'salgado'],
    isQuick: true,
    yieldsLeftovers: false,
  },
  {
    name: 'Arroz com Linguiça',
    description: 'Arroz refogado com linguiça calabresa e ervilhas.',
    tags: ['brasileira', 'linguiça', 'arroz'],
    isQuick: true,
    yieldsLeftovers: true,
  },
  {
    name: 'Bife à Parmegiana',
    description: 'Bife empanado coberto com molho de tomate e queijo derretido.',
    tags: ['brasileira', 'carne', 'forno'],
    isQuick: false,
    yieldsLeftovers: true,
  },
  {
    name: 'Ala Minuta',
    description: 'Prato completo com bife, arroz, feijão, batata frita, ovo e salada.',
    tags: ['brasileira', 'carne', 'completo'],
    isQuick: false,
    yieldsLeftovers: true,
  },
  {
    name: 'Cachorro Quente',
    description: 'Pão com salsicha, molho de tomate cremoso e batata palha.',
    tags: ['lanche', 'salsicha', 'rápido'],
    isQuick: true,
    yieldsLeftovers: false,
  },
  {
    name: 'Hambúrguer',
    description: 'Hambúrguer caseiro com carne, queijo, alface, tomate e molho especial.',
    tags: ['lanche', 'carne', 'rápido'],
    isQuick: true,
    yieldsLeftovers: false,
  },
  {
    name: 'Pizza Pré-pronta',
    description: 'Pizza de forno congelada, prática e saborosa.',
    tags: ['italiana', 'forno', 'congelado'],
    isQuick: true,
    yieldsLeftovers: false,
  },
]

async function seed() {
  await mongoose.connect(config.mongoUri)

  const list = await List.create({
    ownerId: new mongoose.Types.ObjectId(userId),
    name: 'Receitas favoritas',
    description: 'Lista padrão com pratos variados para o dia a dia.',
    members: [],
  })

  for (const dish of dishes) {
    await Dish.create({
      listId: list._id,
      createdBy: new mongoose.Types.ObjectId(userId),
      ...dish,
      requiredIngredients: [],
      optionalIngredients: [],
      tags: dish.tags,
    })
  }

  console.log(`Created list ${list._id} with ${dishes.length} dishes`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
