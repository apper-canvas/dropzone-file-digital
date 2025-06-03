import uploadData from '../mockData/uploads.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let uploads = [...uploadData]

const uploadService = {
  async getAll() {
    await delay(200)
    return [...uploads]
  },

  async getById(id) {
    await delay(150)
    const upload = uploads.find(u => u.id === id)
    if (!upload) throw new Error('Upload not found')
    return { ...upload }
  },

  async create(uploadData) {
    await delay(300)
    const newUpload = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      ...uploadData
    }
    uploads.unshift(newUpload)
    return { ...newUpload }
  },

  async update(id, data) {
    await delay(200)
    const index = uploads.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Upload not found')
    
    uploads[index] = { ...uploads[index], ...data }
    return { ...uploads[index] }
  },

  async delete(id) {
    await delay(200)
    const index = uploads.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Upload not found')
    
    const deletedUpload = uploads[index]
    uploads.splice(index, 1)
    return { ...deletedUpload }
  }
}

export default uploadService