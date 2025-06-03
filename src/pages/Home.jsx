import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { fileService } from '../services'

export default function Home() {
  const [recentFiles, setRecentFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRecentFiles = async () => {
      setLoading(true)
      try {
        const files = await fileService.getAll()
        setRecentFiles(files.slice(0, 6) || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadRecentFiles()
  }, [])

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-primary to-primary-dark p-2 rounded-xl shadow-lg">
                <ApperIcon name="Cloud" className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                DropZone
              </h1>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <ApperIcon name="Search" className="h-4 w-4 mr-2" />
                Search Files
              </Button>
              <Button variant="outline" size="sm">
                <ApperIcon name="Settings" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Main Feature */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Effortless File Management
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Upload, organize, and share your files with our intuitive drag-and-drop interface. 
              Track progress, preview content, and manage everything in one place.
            </motion.p>
          </div>

          <MainFeature />
        </div>
      </section>

      {/* Recent Files Section */}
      {recentFiles.length > 0 && (
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Files</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {recentFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/60 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                              <ApperIcon name={getFileIcon(file.type)} className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium text-slate-900 truncate">
                                {file.name}
                              </CardTitle>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ApperIcon name="MoreHorizontal" className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>{formatFileSize(file.size)}</span>
                          <div className="flex items-center space-x-2">
                            {file.tags?.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage your files efficiently and securely.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: 'Upload',
                title: 'Drag & Drop Upload',
                description: "Simply drag files into the upload zone and watch them upload with real-time progress tracking."
              },
              {
                icon: 'Eye',
                title: 'File Preview',
                description: "Preview images, videos, and documents instantly without downloading them first."
              },
              {
                icon: 'FolderOpen',
                title: 'Smart Organization',
                description: "Organize files into collections and tag them for easy searching and filtering."
              },
              {
                icon: 'Share2',
                title: 'Easy Sharing',
                description: "Share files and collections with others using secure, customizable sharing links."
              },
              {
                icon: 'Download',
                title: 'Batch Operations',
                description: "Select multiple files for bulk operations like download, delete, or organize."
              },
              {
                icon: 'Shield',
                title: 'Secure Storage',
                description: "Your files are stored securely with advanced encryption and privacy protection."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-4">
                      <ApperIcon name={feature.icon} className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="bg-gradient-to-br from-primary to-primary-dark p-2 rounded-xl">
                <ApperIcon name="Cloud" className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">DropZone</span>
            </div>
            <p className="text-slate-400 text-sm text-center sm:text-right">
              © 2024 DropZone. Secure file management platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}