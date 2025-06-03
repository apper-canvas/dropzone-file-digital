import fileData from '../mockData/files.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let files = [...fileData]

const fileService = {
  async getAll() {
    await delay(300)
    return [...files]
  },

  async getById(id) {
    await delay(200)
    const file = files.find(f => f.id === id)
    if (!file) throw new Error('File not found')
    return { ...file }
  },

  async create(fileData) {
    await delay(400)
    const newFile = {
      id: Date.now().toString(),
      uploadDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ...fileData
    }
    files.unshift(newFile)
    return { ...newFile }
  },

  async update(id, data) {
    await delay(300)
    const index = files.findIndex(f => f.id === id)
    if (index === -1) throw new Error('File not found')
    
    files[index] = { 
      ...files[index], 
      ...data, 
      lastModified: new Date().toISOString() 
    }
    return { ...files[index] }
  },

  async delete(id) {
    await delay(250)
    const index = files.findIndex(f => f.id === id)
    if (index === -1) throw new Error('File not found')
    
    const deletedFile = files[index]
    files.splice(index, 1)
    return { ...deletedFile }
  }
}

export default fileService