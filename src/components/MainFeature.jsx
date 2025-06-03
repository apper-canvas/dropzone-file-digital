import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import ApperIcon from './ApperIcon'
import { fileService, uploadService } from '../services'

export default function MainFeature() {
  const [files, setFiles] = useState([])
  const [uploads, setUploads] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('date')
  const [previewFile, setPreviewFile] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    await handleFileUpload(droppedFiles)
  }, [])

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFileUpload(selectedFiles)
  }

  const handleFileUpload = async (fileList) => {
    if (!fileList.length) return

    for (const file of fileList) {
      const uploadId = Date.now() + Math.random()
      
      // Create upload record
      const upload = {
        id: uploadId,
        fileId: null,
        progress: 0,
        speed: 0,
        status: 'uploading',
        startTime: Date.now()
      }
      
      setUploads(prev => [...prev, upload])

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map(u => {
            if (u.id === uploadId && u.progress < 90) {
              return {
                ...u,
                progress: Math.min(u.progress + Math.random() * 20, 90),
                speed: Math.random() * 5 + 1 // MB/s
              }
            }
            return u
          }))
        }, 500)

        // Create file record
        const fileRecord = {
          name: file.name,
          size: file.size,
          type: file.type,
          tags: ['recent'],
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }

        const savedFile = await fileService.create(fileRecord)
        
        // Complete upload
        clearInterval(progressInterval)
        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, progress: 100, status: 'completed', fileId: savedFile.id }
            : u
        ))

        // Update files list
        const allFiles = await fileService.getAll()
        setFiles(allFiles)

        toast.success(`${file.name} uploaded successfully!`)

        // Remove completed upload after delay
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== uploadId))
        }, 2000)

      } catch (error) {
        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, status: 'error' }
            : u
        ))
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type?.includes('image')) return 'Image'
    if (type?.includes('video')) return 'Video'
    if (type?.includes('audio')) return 'Music'
    if (type?.includes('pdf')) return 'FileText'
    if (type?.includes('document') || type?.includes('word')) return 'FileText'
    if (type?.includes('spreadsheet') || type?.includes('excel')) return 'Table'
    if (type?.includes('zip') || type?.includes('archive')) return 'Archive'
    return 'File'
  }

  const handleFileClick = (file) => {
    setPreviewFile(file)
    setShowPreview(true)
  }

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleBulkDelete = async () => {
    if (!selectedFiles.length) return

    try {
      for (const fileId of selectedFiles) {
        await fileService.delete(fileId)
      }
      
      const allFiles = await fileService.getAll()
      setFiles(allFiles)
      setSelectedFiles([])
      toast.success(`${selectedFiles.length} files deleted successfully!`)
    } catch (error) {
      toast.error('Failed to delete files')
    }
  }

  const sortedFiles = files.sort((a, b) => {
    if (sortBy === 'date') return new Date(b.uploadDate) - new Date(a.uploadDate)
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'size') return b.size - a.size
    return 0
  })

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-slate-300 bg-white/60 backdrop-blur-sm hover:border-primary transition-all duration-300">
        <CardContent className="p-8 sm:p-12">
          <div
            className={`text-center transition-all duration-300 ${dragActive ? 'scale-105' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                dragActive ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-600'
              }`}>
                <ApperIcon name={dragActive ? 'CloudArrowUp' : 'Upload'} className="h-10 w-10" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {dragActive ? 'Drop files here!' : 'Drag & drop files here'}
                </h3>
                <p className="text-slate-600 mb-4">
                  Or click to browse and select files from your device
                </p>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-primary-dark"
                  disabled={dragActive}
                >
                  <ApperIcon name="FolderOpen" className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                <Badge variant="outline">Images</Badge>
                <Badge variant="outline">Documents</Badge>
                <Badge variant="outline">Videos</Badge>
                <Badge variant="outline">Archives</Badge>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {uploads.map((upload) => (
              <Card key={upload.id} className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        upload.status === 'completed' ? 'bg-green-100 text-green-600' :
                        upload.status === 'error' ? 'bg-red-100 text-red-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                        <ApperIcon name={
                          upload.status === 'completed' ? 'CheckCircle' :
                          upload.status === 'error' ? 'XCircle' :
                          'Upload'
                        } className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-900">
                        Uploading file...
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {upload.status === 'uploading' && `${upload.speed.toFixed(1)} MB/s`}
                    </div>
                  </div>
                  <Progress value={upload.progress} className="h-2" />
                  <div className="text-xs text-slate-500 mt-1">
                    {upload.progress}% complete
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Management Interface */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Toolbar */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Tabs value={viewMode} onValueChange={setViewMode}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="grid">
                        <ApperIcon name="Grid3X3" className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="list">
                        <ApperIcon name="List" className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="size">Sort by Size</option>
                  </select>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">
                      {selectedFiles.length} selected
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Files Grid/List */}
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          }>
            {sortedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`group cursor-pointer border-2 transition-all duration-200 ${
                  selectedFiles.includes(file.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-200 hover:border-slate-300 bg-white/80 backdrop-blur-sm'
                }`}>
                  <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-3'}>
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center'} gap-3`}>
                      {viewMode === 'grid' && (
                        <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                          {file.thumbnail ? (
                            <img 
                              src={file.thumbnail} 
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ApperIcon name={getFileIcon(file.type)} className="h-8 w-8 text-slate-400" />
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFileSelection(file.id)
                              }}
                              className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                            >
                              {selectedFiles.includes(file.id) ? (
                                <ApperIcon name="CheckSquare" className="h-4 w-4 text-primary" />
                              ) : (
                                <ApperIcon name="Square" className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex ${viewMode === 'list' ? 'items-center' : 'flex-col'} gap-2 flex-1`}>
                        {viewMode === 'list' && (
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <ApperIcon name={getFileIcon(file.type)} className="h-5 w-5 text-slate-600" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {file.tags.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFileClick(file)
                            }}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ApperIcon name="Eye" className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFileSelection(file.id)
                            }}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {selectedFiles.includes(file.id) ? (
                              <ApperIcon name="CheckSquare" className="h-4 w-4 text-primary" />
                            ) : (
                              <ApperIcon name="Square" className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <ApperIcon name={getFileIcon(previewFile?.type)} className="h-5 w-5" />
              <span>{previewFile?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {previewFile && (
            <div className="space-y-4">
              {/* Preview Area */}
              <div className="bg-slate-50 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
                {previewFile.thumbnail ? (
                  <img 
                    src={previewFile.thumbnail} 
                    alt={previewFile.name}
                    className="max-w-full max-h-[400px] object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <ApperIcon name={getFileIcon(previewFile.type)} className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Preview not available for this file type</p>
                  </div>
                )}
              </div>
              
              {/* File Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Size:</span>
                  <span className="ml-2 text-slate-600">{formatFileSize(previewFile.size)}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Type:</span>
                  <span className="ml-2 text-slate-600">{previewFile.type || 'Unknown'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Uploaded:</span>
                  <span className="ml-2 text-slate-600">
                    {new Date(previewFile.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Tags:</span>
                  <div className="ml-2 flex flex-wrap gap-1">
                    {previewFile.tags?.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    )) || <span className="text-slate-600">None</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}