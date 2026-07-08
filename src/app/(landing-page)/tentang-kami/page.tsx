import { Metadata } from 'next';

import { Footer } from '@/components/landing-page/Footer';
import { Navbar } from '@/components/landing-page/Navbar';
import { TeamCard } from '@/components/landing-page/TeamCard';

import { team } from '@/constant/team';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'Kenali visi LMS Literasi Syariah dan tim pengembang di balik taman bermain belajar ekonomi syariah ini.',
};

export default function TentangKamiPage() {
  return (
    <main>
      <Navbar />

      {/* Tentang & Visi */}
      <section className='relative overflow-hidden bg-linear-to-br from-primary-700 to-primary-500 py-24'>
        <div className='layout relative z-10 max-w-3xl'>
          <div className='text-center mb-14'>
            <p className='text-accent-lime tracking-widest uppercase text-sm font-bold mb-4'>
              Tentang Kami
            </p>
            <h1 className='font-display text-3xl md:text-4xl font-bold text-white'>
              Tentang Kami
            </h1>
          </div>

          <div className='space-y-10'>
            <div>
              <h2 className='font-display text-2xl font-bold text-white mb-3'>
                Tentang Aplikasi
              </h2>
              <p className='text-white/85 leading-relaxed'>
                LMS Literasi Syariah adalah{' '}
                <strong>taman bermain belajar</strong> (learning playground)
                yang dirancang untuk menumbuhkan literasi ekonomi syariah pada
                pelajar SMP–SMA (usia 12–18 tahun). Berbeda dari platform kursus
                pada umumnya, aplikasi ini mengedepankan pengalaman belajar yang{' '}
                <strong>interaktif dan menyenangkan</strong> — bermain sambil
                belajar, bukan sekadar menonton materi.
              </p>
            </div>

            <div>
              <h2 className='font-display text-2xl font-bold text-white mb-3'>
                Visi
              </h2>
              <p className='text-white/85 leading-relaxed'>
                Menjadikan konsep ekonomi syariah yang abstrak menjadi nyata dan
                mudah dipahami melalui mekanik permainan yang bermakna untuk
                mendukung literasi syariah di Indonesia. Fitur unggulan kami,{' '}
                <strong>Drag and Drop</strong>, mengajak siswa
                mengklasifikasikan halal/haram dan mengelompokkan akad muamalah
                secara langsung, sehingga belajar terasa seperti bermain, bukan
                ujian. Poin, lencana, dan papan peringkat hanyalah permulaan;
                inti pengalaman kami ada pada interaksi yang membangun
                pemahaman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tim Pengembang */}
      <section className='py-24 bg-surface-soft'>
        <div className='layout'>
          <div className='text-center mb-14'>
            <p className='text-primary-700 tracking-widest uppercase text-sm font-bold mb-4'>
              Dibalik Layar
            </p>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-dark'>
              Tim Pengembang
            </h2>
            <p className='mt-4 text-on-surface-soft max-w-2xl mx-auto'>
              Aplikasi ini dikembangkan sebagai Tugas Akhir di Institut
              Teknologi Sepuluh Nopember (ITS) dengan metodologi ADDIE, oleh tim
              lintas platform.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto'>
            {team.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
