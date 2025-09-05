'use client'

import { memo } from 'react'
import { UsersIcon } from '@heroicons/react/24/outline'

const MembersTab = memo(function MembersTab({ 
  members, 
  newMemberEmail, 
  setNewMemberEmail, 
  handleAddMember, 
  user, 
  channel 
}) {
  const canAddMembers = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      {canAddMembers && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Member</h3>
          <div className="flex space-x-3">
            <input
              type="email"
              placeholder="Enter email address"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent"
            />
            <button
              onClick={handleAddMember}
              disabled={!newMemberEmail}
              className="px-4 py-2 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#E55A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Members ({Array.isArray(members) ? members.length : 0})</h3>
        {!Array.isArray(members) || members.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No members in this channel.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {(Array.isArray(members) ? members : []).map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {member.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.user?.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default MembersTab
