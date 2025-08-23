"use client";
import { useEffect, useState } from "react";

export default function ProfilePage({ params }) {
  const { username } = params;
  const [bio, setBio] = useState("");
  const [savedBio, setSavedBio] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(`profile-${username}`);
    if (stored) setSavedBio(stored);
  }, [username]);

  const saveBio = () => {
    localStorage.setItem(`profile-${username}`, bio);
    setSavedBio(bio);
    setBio("");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Profile of {username}</h1>

      {savedBio && (
        <p className="mb-2">
          <strong>Bio: </strong>
          {savedBio}
        </p>
      )}

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write your bio..."
        className="border rounded w-full p-2 mb-2"
      />
      <button
        onClick={saveBio}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Bio
      </button>
    </div>
  );
}