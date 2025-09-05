'use client'

import { useRef, useEffect, memo } from 'react'
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'

const ChatTab = memo(function ChatTab({ 
  messages, 
  newMessage, 
  setNewMessage, 
  handleSendMessage, 
  handleTyping,
  typingUsers = [], 
  user, 
  channel,
  handleMessageAction,
  replyTo,
  setReplyTo
}) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderMessage = (message) => {
    const isOwnMessage = message.createdById === user?.id
    const canManage = user?.role === 'TEACHER' || user?.role === 'ADMIN' || isOwnMessage

    return (
      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {!isOwnMessage && (
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {message.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{message.createdBy?.name}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          
          <div className={`relative group ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
            <div
              className={`rounded-lg px-4 py-2 cursor-pointer transition-colors ${
                isOwnMessage 
                  ? 'bg-blue-100 text-blue-900 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
              onClick={() => {
                if (canManage) {
                  // Show action menu or handle click
                }
              }}
            >
              {message.replyTo && (
                <div className={`text-xs mb-1 ${isOwnMessage ? 'text-blue-700' : 'text-gray-500'}`}>
                  {message.replyTo.text}
                </div>
              )}
              
              {message.text && (
                <div className="whitespace-pre-wrap break-words">{message.text}</div>
              )}
            </div>
            
            {/* All action buttons - arranged vertically */}
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-10 flex flex-col gap-1 min-w-max">
              {/* Reply button - available to everyone */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setReplyTo(message)
                }}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded whitespace-nowrap"
                title="Reply to message"
              >
                Reply
              </button>

              {/* Other action buttons - restricted to canManage */}
              {canManage && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMessageAction('copy', message)
                    }}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded whitespace-nowrap"
                    title="Copy message"
                  >
                    Copy
                  </button>
                  {isOwnMessage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMessageAction('edit', message)
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded whitespace-nowrap"
                      title="Edit message"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMessageAction('delete', message)
                    }}
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded whitespace-nowrap"
                    title="Delete message"
                  >
                    Delete
                  </button>
                  {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMessageAction('pin', message)
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded whitespace-nowrap"
                      title="Pin message"
                    >
                      Pin
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Array.from(new Map(messages.map(msg => [msg.id, msg])).values()).map(renderMessage)
        )}
        
        {typingUsers && typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-gray-50 border-t border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{replyTo.text}</span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onInput={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#E55A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
})

export default ChatTab
