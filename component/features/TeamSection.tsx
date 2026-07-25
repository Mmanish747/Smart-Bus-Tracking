"use client";

import Image from "next/image";
import Link from "next/link";
import {  ChevronRight } from "lucide-react";
import { IoLogoLinkedin } from "react-icons/io";
import { useState } from "react";

const teamMembers = [
  {
    name: "Manish Khadka",
    role: "CEO & Founder",
    description:
      "Passionate about smart mobility and building technology that makes a difference.",
    image: "/team/member1.jpg",
    linkedin: "#",
  },
  {
    name: "Pratik Adhikari",
    role: "CTO & FullStack Developer",
    description:
      "Leads technology and product development with a focus on innovation and scalability.",
    image: "/team/member2.jpg",
    linkedin: "#",
  },
  {
    name: "Nischal Joshi",
    role: "Head of Operations",
    description:
      "Ensures smooth operations and strong partnerships across the transportation network.",
    image: "/team/member3.jpg",
    linkedin: "#",
  },
  {
    name: "Priya Gurung",
    role: "UX/UI Designer",
    description:
      "Designs user-friendly experiences that make commuting simple and enjoyable.",
    image: "/team/member4.jpg",
    linkedin: "#",
  },
  {
    name: "Priya Gurung",
    role: "UX/UI Designer",
    description:
      "Designs user-friendly experiences that make commuting simple and enjoyable.",
    image: "/team/member4.jpg",
    linkedin: "#",
  },
  {
    name: "Priya Gurung",
    role: "UX/UI Designer",
    description:
      "Designs user-friendly experiences that make commuting simple and enjoyable.",
    image: "/team/member4.jpg",
    linkedin: "#",
  },
  {
    name: "Priya Gurung",
    role: "UX/UI Designer",
    description:
      "Designs user-friendly experiences that make commuting simple and enjoyable.",
    image: "/team/member4.jpg",
    linkedin: "#",
  },
  {
    name: "Priya Gurung",
    role: "UX/UI Designer",
    description:
      "Designs user-friendly experiences that make commuting simple and enjoyable.",
    image: "/team/member4.jpg",
    linkedin: "#",
  },
  {
    name: "Priya Gurung",
    role: "UX/UI Designer",
    description:
      "Designs user-friendly experiences that make commuting simple and enjoyable.",
    image: "/team/member4.jpg",
    linkedin: "#",
  },
  {
    name: "Priya Gurung",
    role: "UX/UI Designer",
    description:
      "Designs user-friendly experiences that make commuting simple and enjoyable.",
    image: "/team/member4.jpg",
    linkedin: "#",
  },

];

const TeamSection = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleMembers = showAll ? teamMembers: teamMembers.slice(0,3);
  return (
    <section className="space-y-6 pb-8">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Meet the Team
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          The passionate people behind Smart Bus Tracking System
        </p>
      </div>

     
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visibleMembers.map((member,index) => (
          <div
            key={index}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
           
            <div className="mb-4 flex items-start gap-4">
              <Image
                src={member.image}
                alt={member.name}
                width={56}
                height={56}
                className="rounded-full border border-gray-200 object-cover"
              />

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {member.name}
                </h3>

                <p className="text-xs text-gray-500">
                  {member.role}
                </p>
              </div>
            </div>

            
            <p className="flex-1 text-xs leading-6 text-gray-600">
              {member.description}
            </p>

           
            <div className="mt-5">
              <Link
                href={member.linkedin}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-primary transition hover:bg-green-200"
              >
                <IoLogoLinkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

     
      <div className="flex justify-center pt-2">
        {teamMembers.length > 4 && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              {showAll ? "Show Less" : "View All Team Members"}

              <ChevronRight className={`h-4 w-4 transition-transform ${
                  showAll ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;