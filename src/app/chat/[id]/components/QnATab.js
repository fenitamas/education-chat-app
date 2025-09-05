'use client'

import { memo } from 'react'
import { 
  AcademicCapIcon, 
  ClipboardDocumentIcon as CopyIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const QnATab = memo(function QnATab({ 
  questions, 
  newQuestion, 
  setNewQuestion, 
  handleAddQuestion, 
  handleAnswerQuestion, 
  handleEditQuestion,
  handleDeleteQuestion,
  handleEditAnswer,
  handleDeleteAnswer,
  answerInputs,
  setAnswerInputs,
  user, 
  channel 
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ask a Question</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Question title"
            value={newQuestion.title}
            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent"
          />
          <textarea
            placeholder="Question description"
            value={newQuestion.description}
            onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent resize-none"
          />
          <button
            onClick={handleAddQuestion}
            disabled={!newQuestion.title || !newQuestion.description}
            className="w-full px-4 py-2 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#E55A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ask Question
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>
        {questions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{question.title}</h4>
                    <p className="text-gray-600 mt-2">{question.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      {question.createdBy?.id !== user?.id && (
                        <span className="text-sm text-gray-500">
                          Asked by {question.createdBy?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        const textToCopy = `${question.title}\n\n${question.description}`
                        navigator.clipboard.writeText(textToCopy)
                        toast.success('Question copied to clipboard')
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy question"
                    >
                      <CopyIcon className="h-4 w-4" />
                    </button>
                    {question.createdBy?.id === user?.id && (
                      <button
                        onClick={() => handleEditQuestion(question.id)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit question"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {(question.createdBy?.id === user?.id || user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete question"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {question.answers && question.answers.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h5 className="font-medium text-gray-900">Answers:</h5>
                    {question.answers.map((answer) => (
                      <div key={answer.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-700">{answer.text}</p>
                            {answer.createdBy?.id !== user?.id && (
                              <span className="text-sm text-gray-500 mt-2 block">
                                Answered by {answer.createdBy?.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(answer.text)
                                toast.success('Answer copied to clipboard')
                              }}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Copy answer"
                            >
                              <CopyIcon className="h-4 w-4" />
                            </button>
                            {answer.createdBy?.id === user?.id && (
                              <button
                                onClick={() => handleEditAnswer(answer.id)}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit answer"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {answer.createdBy?.id === user?.id && (
                              <button
                                onClick={() => handleDeleteAnswer(answer.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete answer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Enter your answer..."
                      value={answerInputs[question.id] || ''}
                      onChange={(e) => setAnswerInputs(prev => ({
                        ...prev,
                        [question.id]: e.target.value
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent text-sm"
                    />
                    <button
                      onClick={() => {
                        const answer = answerInputs[question.id]
                        if (answer && answer.trim()) {
                          handleAnswerQuestion(question.id, answer.trim())
                          setAnswerInputs(prev => ({
                            ...prev,
                            [question.id]: ''
                          }))
                        }
                      }}
                      disabled={!answerInputs[question.id] || !answerInputs[question.id].trim()}
                      className="px-4 py-2 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#E55A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Add Answer
                    </button>
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

export default QnATab
