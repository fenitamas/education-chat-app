'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  MapPinIcon as PinIcon, 
  XMarkIcon,
  PaperClipIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  LinkIcon,
  TrashIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentIcon as CopyIcon,
  UserPlusIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UsersIcon,
  CheckIcon,
  XCircleIcon,
  HandThumbUpIcon as ThumbUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

// Lazy load heavy components
const ChatTab = lazy(() => import('./components/ChatTab'))
const ResourcesTab = lazy(() => import('./components/ResourcesTab'))
const QnATab = lazy(() => import('./components/QnATab'))
const MembersTab = lazy(() => import('./components/MembersTab'))

// Loading component for lazy loaded tabs
const TabLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A3D]"></div>
  </div>
)

// Main ChannelPage Component
export default function ChannelPage() {
  const params = useParams()
  const router = useRouter()
  const [channel, setChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [resources, setResources] = useState([])
  const [questions, setQuestions] = useState([])
  const [members, setMembers] = useState([])
  const [user, setUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [newResource, setNewResource] = useState({ title: '', url: '', description: '' })
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '' })
  const [answerInputs, setAnswerInputs] = useState({})
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [typingUsers, setTypingUsers] = useState([])
  const [showPinnedMessage, setShowPinnedMessage] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showDeleteChannelModal, setShowDeleteChannelModal] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const processedMessageIds = useRef(new Set())
  const typingTimeoutRef = useRef(null)

  const tabs = [
    { id: 'chat', name: 'Chat' },
    { id: 'resources', name: 'Resources' },
    { id: 'qna', name: 'Q&A' },
    { id: 'members', name: 'Members' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    // Parallel data fetching for better performance
    const fetchData = async () => {
      try {
        const [userRes, channelRes, messagesRes, resourcesRes, questionsRes, membersRes] = await Promise.allSettled([
          fetch('/api/users/profile', { headers }),
          fetch(`/api/channels/${params.id}`, { headers }),
          fetch(`/api/channels/${params.id}/messages`, { headers }),
          fetch(`/api/channels/${params.id}/resources`, { headers }),
          fetch(`/api/channels/${params.id}/qna`, { headers }),
          fetch(`/api/channels/${params.id}/members`, { headers })
        ])

        // Handle user data
        if (userRes.status === 'fulfilled') {
          const userData = await userRes.value.json()
          if (userData.error) {
            router.push('/auth/login')
            return
          }
          setUser(userData)
        }

        // Handle channel data
        if (channelRes.status === 'fulfilled') {
          const channelData = await channelRes.value.json()
          if (channelData.error) {
            toast.error(channelData.error)
          } else {
            setChannel(channelData)
          }
        }

        // Handle messages
        if (messagesRes.status === 'fulfilled') {
          const messagesData = await messagesRes.value.json()
          if (messagesData.error) {
            toast.error(messagesData.error)
          } else {
            setMessages(messagesData)
            messagesData.forEach(msg => processedMessageIds.current.add(msg.id))
          }
        }

        // Handle resources
        if (resourcesRes.status === 'fulfilled') {
          const resourcesData = await resourcesRes.value.json()
          if (resourcesData.error) {
            toast.error(resourcesData.error)
          } else {
            setResources(resourcesData.resources || [])
          }
        }

        // Handle questions
        if (questionsRes.status === 'fulfilled') {
          const questionsData = await questionsRes.value.json()
          if (questionsData.error) {
            toast.error(questionsData.error)
          } else {
            setQuestions(questionsData.questions || [])
          }
        }

        // Handle members
        if (membersRes.status === 'fulfilled') {
          const membersData = await membersRes.value.json()
          if (membersData.error) {
            toast.error(membersData.error)
          } else {
            setMembers(membersData.members || [])
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load channel data')
      }
    }

    fetchData()

    // Set up SSE for real-time updates
    const eventSource = new EventSource(`/api/channels/${params.id}/events`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        const messageId = data.payload.id
        // Check if we've already processed this message
        if (processedMessageIds.current.has(messageId)) {
          return
        }
        processedMessageIds.current.add(messageId)
        
        setMessages(prev => {
          // Double check if message already exists in state
          const exists = prev.some(msg => msg.id === messageId)
          if (exists) return prev
          return [...prev, data.payload]
        })
      } else if (data.type === 'typing') {
        setTypingUsers(data.users)
      }
    }

    return () => {
      eventSource.close()
      processedMessageIds.current.clear()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [params.id])

  const handleTyping = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await fetch(`/api/channels/${params.id}/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isTyping: true })
      })

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set timeout to stop typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/channels/${params.id}/typing`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ isTyping: false })
          })
        } catch (error) {
          console.error('Error stopping typing indicator:', error)
        }
      }, 3000)
    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Clear typing timeout and stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    try {
      // Stop typing indicator
      await fetch(`/api/channels/${params.id}/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isTyping: false })
      })

      const response = await fetch(`/api/channels/${params.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newMessage,
          replyToId: replyTo?.id
        })
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setNewMessage('')
        setReplyTo(null)
        // Don't add the message here as it will come through SSE
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleMessageAction = async (action, message) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      switch (action) {
        case 'copy':
          await navigator.clipboard.writeText(message.text || '')
          toast.success('Message copied to clipboard')
          break

        case 'delete':
          const deleteResponse = await fetch(`/api/channels/${params.id}/messages/${message.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (deleteResponse.ok) {
            setMessages(prev => prev.filter(m => m.id !== message.id))
            toast.success('Message deleted')
          } else {
            const error = await deleteResponse.json()
            toast.error(error.error || 'Failed to delete message')
          }
          break

        case 'edit':
          const newText = prompt('Edit message:', message.text)
          if (newText && newText.trim() && newText !== message.text) {
            const editResponse = await fetch(`/api/channels/${params.id}/messages/${message.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ text: newText.trim() })
            })
            
            if (editResponse.ok) {
              const updatedMessage = await editResponse.json()
              setMessages(prev => prev.map(m => m.id === message.id ? updatedMessage.message : m))
              toast.success('Message updated')
            } else {
              const error = await editResponse.json()
              toast.error(error.error || 'Failed to update message')
            }
          }
          break

        case 'pin':
          const pinResponse = await fetch(`/api/channels/${params.id}/pin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ messageId: message.id })
          })
          
          if (pinResponse.ok) {
            toast.success('Message pinned')
            // Refresh channel data to get updated pinned message
            window.location.reload()
          } else {
            const error = await pinResponse.json()
            toast.error(error.error || 'Failed to pin message')
          }
          break

        default:
          break
      }
    } catch (error) {
      console.error('Message action error:', error)
      toast.error('Action failed')
    }
  }

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newResource)
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setNewResource({ title: '', url: '', description: '' })
        setResources(prev => [...prev, data])
        toast.success('Resource added successfully')
      }
    } catch (error) {
      console.error('Error adding resource:', error)
      toast.error('Failed to add resource')
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setResources(prev => prev.filter(r => r.id !== resourceId))
        toast.success('Resource deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.title || !newQuestion.description) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/qna`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newQuestion)
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setNewQuestion({ title: '', description: '' })
        setQuestions(prev => [...prev, data])
        toast.success('Question added successfully')
      }
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('Failed to add question')
    }
  }

  const handleAnswerQuestion = async (questionId, answer) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/qna/${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'answer', text: answer })
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, answers: [...(q.answers || []), data] }
            : q
        ))
        toast.success('Answer added successfully')
      }
    } catch (error) {
      console.error('Error adding answer:', error)
      toast.error('Failed to add answer')
    }
  }

  const handleEditQuestion = async (questionId) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    const newTitle = prompt('Enter new question title:', question.title)
    if (!newTitle || newTitle.trim() === '') return

    const newDescription = prompt('Enter new question description:', question.description)
    if (!newDescription || newDescription.trim() === '') return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/qna/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim() })
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, title: newTitle.trim(), description: newDescription.trim() }
            : q
        ))
        toast.success('Question updated successfully')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Failed to update question')
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/qna/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setQuestions(prev => prev.filter(q => q.id !== questionId))
        toast.success('Question deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  const handleEditAnswer = async (answerId) => {
    const answer = questions.flatMap(q => q.answers || []).find(a => a.id === answerId)
    if (!answer) return

    const newText = prompt('Enter new answer text:', answer.text)
    if (!newText || newText.trim() === '') return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/qna/answers/${answerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newText.trim() })
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setQuestions(prev => prev.map(q => ({
          ...q,
          answers: (q.answers || []).map(a => 
            a.id === answerId 
              ? { ...a, text: newText.trim() }
              : a
          )
        })))
        toast.success('Answer updated successfully')
      }
    } catch (error) {
      console.error('Error updating answer:', error)
      toast.error('Failed to update answer')
    }
  }

  const handleDeleteAnswer = async (answerId) => {
    if (!confirm('Are you sure you want to delete this answer? This action cannot be undone.')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/qna/answers/${answerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setQuestions(prev => prev.map(q => ({
          ...q,
          answers: (q.answers || []).filter(a => a.id !== answerId)
        })))
        toast.success('Answer deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
      toast.error('Failed to delete answer')
    }
  }



  const handleAddMember = async () => {
    if (!newMemberEmail) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: newMemberEmail })
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        setNewMemberEmail('')
        setMembers(data.members || [])
        toast.success('Member added successfully')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Failed to add member')
    }
  }

  const handleLeaveChannel = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Left channel successfully')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error leaving channel:', error)
      toast.error('Failed to leave channel')
    }
  }

  const handleDeleteChannel = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/channels/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Channel deleted successfully')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error deleting channel:', error)
      toast.error('Failed to delete channel')
    }
  }

  if (!channel || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A3D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading channel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{channel?.name}</h1>
                <p className="text-sm text-gray-500">{channel?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {channel?.pinnedMessage && (
                <button
                  onClick={() => setShowPinnedMessage(!showPinnedMessage)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PinIcon className="h-5 w-5" />
                </button>
              )}
              {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                <button
                  onClick={() => setShowDeleteChannelModal(true)}
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Channel
                </button>
              )}
              {user?.role === 'STUDENT' && (
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Leave Channel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Message */}
      {showPinnedMessage && channel?.pinnedMessage && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start space-x-3">
              <PinIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Pinned Message</p>
                <p className="text-sm text-yellow-700 mt-1">{channel.pinnedMessage.text}</p>
              </div>
              <button
                onClick={() => setShowPinnedMessage(false)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#FF6A3D] text-[#FF6A3D]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <Suspense fallback={<TabLoader />}>
              {activeTab === 'chat' && (
                <ChatTab
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  handleTyping={handleTyping}
                  typingUsers={typingUsers}
                  user={user}
                  channel={channel}
                  handleMessageAction={handleMessageAction}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                />
              )}
              {activeTab === 'resources' && (
                <ResourcesTab
                  resources={resources}
                  newResource={newResource}
                  setNewResource={setNewResource}
                  handleAddResource={handleAddResource}
                  handleDeleteResource={handleDeleteResource}
                  user={user}
                  channel={channel}
                />
              )}
              {activeTab === 'qna' && (
                <QnATab
                  questions={questions}
                  newQuestion={newQuestion}
                  setNewQuestion={setNewQuestion}
                  handleAddQuestion={handleAddQuestion}
                  handleAnswerQuestion={handleAnswerQuestion}
                  handleEditQuestion={handleEditQuestion}
                  handleDeleteQuestion={handleDeleteQuestion}
                  handleEditAnswer={handleEditAnswer}
                  handleDeleteAnswer={handleDeleteAnswer}
                  answerInputs={answerInputs}
                  setAnswerInputs={setAnswerInputs}
                  user={user}
                  channel={channel}
                />
              )}
              {activeTab === 'members' && (
                <MembersTab
                  members={members}
                  newMemberEmail={newMemberEmail}
                  setNewMemberEmail={setNewMemberEmail}
                  handleAddMember={handleAddMember}
                  user={user}
                  channel={channel}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>

      {/* Leave Channel Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Channel</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave "{channel?.name}"? You won't be able to access it anymore.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveChannel}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Leave Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Channel Modal */}
      {showDeleteChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Channel</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{channel?.name}"? This action cannot be undone and will permanently remove all messages, resources, and Q&A data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteChannelModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChannel}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
