import collectionData from '../mockData/collections.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let collections = [...collectionData]

const collectionService = {
  async getAll() {
    await delay(250)
    return [...collections]
  },

  async getById(id) {
    await delay(200)
    const collection = collections.find(c => c.id === id)
    if (!collection) throw new Error('Collection not found')
    return { ...collection }
  },

  async create(collectionData) {
    await delay(350)
    const newCollection = {
      id: Date.now().toString(),
      createdDate: new Date().toISOString(),
      files: [],
      sharedWith: [],
      ...collectionData
    }
    collections.unshift(newCollection)
    return { ...newCollection }
  },

  async update(id, data) {
    await delay(300)
    const index = collections.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Collection not found')
    
    collections[index] = { ...collections[index], ...data }
    return { ...collections[index] }
  },

  async delete(id) {
    await delay(250)
    const index = collections.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Collection not found')
    
    const deletedCollection = collections[index]
    collections.splice(index, 1)
    return { ...deletedCollection }
  }
}

export default collectionService