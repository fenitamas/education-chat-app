export default function ProfileCard({ user }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-80 hover:shadow-2xl transition">
      <img
        src={user.avatar}
        alt={user.username}
        className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500"
      />
      <h2 className="text-xl font-bold text-center mt-4">{user.name}</h2>
      <p className="text-gray-500 text-center">@{user.username}</p>
      <p className="text-sm text-center mt-2">{user.bio}</p>
    </div>
  );
}