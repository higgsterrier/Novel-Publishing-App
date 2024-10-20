import { Book, Feather, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Empower Your Story
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Feather className="w-12 h-12 text-blue-500" />}
          title="Publish Your Novel"
          description="Share your story with the world. Easy publishing tools for new authors."
        />
        <FeatureCard
          icon={<Book className="w-12 h-12 text-green-500" />}
          title="Discover New Worlds"
          description="Explore a vast library of fresh, original novels from emerging authors."
        />
        <FeatureCard
          icon={<Users className="w-12 h-12 text-purple-500" />}
          title="Connect with Readers"
          description="Build your audience and engage with your readers directly."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-center mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
