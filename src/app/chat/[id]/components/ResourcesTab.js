'use client'

import { memo } from 'react'
import { 
  BookOpenIcon, 
  LinkIcon, 
  VideoCameraIcon, 
  DocumentIcon, 
  TrashIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline'

const ResourcesTab = memo(function ResourcesTab({ 
  resources, 
  newResource, 
  setNewResource, 
  handleAddResource, 
  handleDeleteResource, 
  user, 
  channel 
}) {
  const canAddResource = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  // Determine icon based on URL or content
  const getResourceIcon = (url) => {
    if (!url || typeof url !== 'string') {
      return <LinkIcon className="h-6 w-6 text-gray-500" />
    }
    
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
      return <VideoCameraIcon className="h-6 w-6 text-red-500" />
    } else if (url.includes('docs.google.com') || url.includes('.pdf') || url.includes('.doc')) {
      return <DocumentIcon className="h-6 w-6 text-blue-500" />
    } else if (url.includes('github.com') || url.includes('gitlab.com')) {
      return <LinkIcon className="h-6 w-6 text-gray-700" />
    } else {
      return <LinkIcon className="h-6 w-6 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      {canAddResource && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Resource</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Resource title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent"
            />
            <input
              type="url"
              placeholder="Resource URL"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent"
            />
            <textarea
              placeholder="Resource description"
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent resize-none"
            />
            <button
              onClick={handleAddResource}
              disabled={!newResource.title || !newResource.url}
              className="w-full px-4 py-2 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#E55A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Resource
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resources</h3>
        {resources.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No resources available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getResourceIcon(resource.url)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {resource.title}
                          </a>
                        </h4>
                        {resource.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{resource.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(resource.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Open resource"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </a>
                        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete resource"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default ResourcesTab
