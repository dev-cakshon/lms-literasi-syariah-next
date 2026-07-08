export interface TeamMember {
  name: string;
  role: string; // e.g. 'Web Developer'
  photoPath: string; // '/images/team/farrel.jpg'
}

export const team: TeamMember[] = [
  {
    name: 'Fernandio Farrel',
    role: 'Web Developer',
    photoPath: '/images/team/farrel.jpg',
  },
  {
    name: 'Hasan Kamal',
    role: 'Mobile Developer',
    photoPath: '/images/team/ikmal.jpeg',
  },
  {
    name: 'Alif Faturrohman',
    role: 'Chatbot Developer',
    photoPath: '/images/team/alif.jpeg',
  },
];
