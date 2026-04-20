import Image from "next/image";

const Page = () => {
  const cards = [
    {
      title: "Web Development",
      desc: "Build modern, fast, and scalable web applications.",
      img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    },
    {
      title: "UI/UX Design",
      desc: "Design clean and user-friendly interfaces.",
      img: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e",
    },
    {
      title: "Mobile Apps",
      desc: "Create cross-platform mobile applications.",
      img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
    },
    {
      title: "AI Solutions",
      desc: "Integrate AI to automate and enhance systems.",
      img: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50 flex flex-col items-center">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-10 bg-linear-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
        Our Services
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl w-full">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group"
          >
            {/* Image */}
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={`${card.img}?auto=format&fit=crop&w=800&q=80`}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                {card.title}
              </h2>
              <p className="text-gray-500 text-sm mt-2">{card.desc}</p>

              {/* Button */}
              <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
