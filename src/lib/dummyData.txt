type Course = {
    _id: string;
    title: string;
    imageUrl: null;
    price: number;
    progress: number | null;
    category: string;
    chaptersLength: number;
};

type DashboardCourses = {
    completedCourses: Course[];
    courseInProgress: Course[];
};

export const dummyDashboardData: DashboardCourses = {
    completedCourses: [
        {
            _id: '1',
            title: 'Dasar-Dasar Fiqih Muamalah',
            imageUrl: null,
            price: 150000,
            progress: 100,
            category: 'Fiqih Muamalah',
            chaptersLength: 6,
        },
        {
            _id: '2',
            title: 'Investasi Halal & Sukuk',
            imageUrl: null,
            price: 200000,
            progress: 100,
            category: 'Investasi Syariah',
            chaptersLength: 8,
        },
    ],
    courseInProgress: [
        {
            _id: '3',
            title: 'Manajemen Keuangan Syariah',
            imageUrl: null,
            price: 250000,
            progress: 65,
            category: 'Keuangan Syariah',
            chaptersLength: 10,
        },
        {
            _id: '4',
            title: 'Akuntansi Lembaga Keuangan Syariah',
            imageUrl: null,
            price: 180000,
            progress: 30,
            category: 'Akuntansi Syariah',
            chaptersLength: 12,
        },
    ],
};

// Dummy course data for course layout
export const dummyCourseData = {
    userId: 'user-123',
    course: {
        _id: '1',
        title: 'Dasar-Dasar Fiqih Muamalah',
        price: 150000,
        attachments: [
            'Modul_Fiqih_Muamalah.pdf',
            'Ringkasan_Akad_Islam.pdf',
            'Studi_Kasus_Transaksi_Syariah.pdf',
        ],
        purchased: {
            'user-123': true, // Current user has purchased
        },
    },
    chapters: [
        {
            _id: 'ch-1',
            courseId: '1',
            title: 'Pengenalan Fiqih Muamalah',
            description: 'Memahami konsep dasar fiqih muamalah, sejarah perkembangannya, dan relevansinya dalam kehidupan ekonomi modern. Bab ini akan membahas definisi, ruang lingkup, dan prinsip-prinsip fundamental yang menjadi landasan transaksi syariah.',
            playbackId: 'video-ch-1',
            isCompleted: {
                'user-123': true,
            },
            isFree: true,
        },
        {
            _id: 'ch-2',
            courseId: '1',
            title: 'Prinsip-Prinsip Jual Beli dalam Islam',
            description: 'Mempelajari rukun dan syarat jual beli yang sah menurut syariat Islam, termasuk prinsip kerelaan (ridha), transparansi, dan keadilan. Memahami perbedaan jual beli halal dan yang dilarang dalam Islam.',
            playbackId: 'video-ch-2',
            isCompleted: {
                'user-123': true,
            },
            isFree: true,
        },
        {
            _id: 'ch-3',
            courseId: '1',
            title: 'Akad dan Jenisnya',
            description: 'Mendalami berbagai jenis akad dalam transaksi syariah seperti murabahah, musyarakah, mudharabah, ijarah, dan lainnya. Memahami karakteristik, aplikasi, dan implikasi hukum dari masing-masing akad.',
            playbackId: 'video-ch-3',
            isCompleted: {
                'user-123': false,
            },
            isFree: false,
        },
        {
            _id: 'ch-4',
            courseId: '1',
            title: 'Riba dan Larangan dalam Muamalah',
            description: 'Memahami konsep riba, gharar, dan maysir yang dilarang dalam Islam. Belajar mengidentifikasi dan menghindari praktik-praktik yang mengandung unsur-unsur terlarang ini dalam transaksi ekonomi.',
            playbackId: 'video-ch-4',
            isCompleted: {
                'user-123': false,
            },
            isFree: false,
        },
        {
            _id: 'ch-5',
            courseId: '1',
            title: 'Mudharabah dan Musyarakah',
            description: 'Mempelajari secara mendalam konsep kemitraan dalam Islam melalui mudharabah (bagi hasil) dan musyarakah (joint venture). Memahami aplikasinya dalam lembaga keuangan syariah dan bisnis modern.',
            playbackId: 'video-ch-5',
            isCompleted: {
                'user-123': false,
            },
            isFree: false,
        },
        {
            _id: 'ch-6',
            courseId: '1',
            title: 'Sistem Ekonomi Syariah Modern',
            description: 'Mengeksplorasi penerapan prinsip-prinsip ekonomi syariah dalam konteks ekonomi global modern, termasuk perbankan syariah, pasar modal syariah, dan fintech syariah. Membahas tantangan dan peluang implementasi ekonomi syariah di era digital.',
            playbackId: 'video-ch-6',
            isCompleted: {
                'user-123': false,
            },
            isFree: false,
        },
    ],
};

// Browse page courses
export const dummyBrowseCourses = [
    {
        _id: '1',
        title: 'Dasar-Dasar Fiqih Muamalah',
        imageUrl: null,
        price: 150000,
        category: 'Fiqih Muamalah',
        chaptersLength: 6,
        progress: 100,
    },
    {
        _id: '2',
        title: 'Investasi Halal & Sukuk',
        imageUrl: null,
        price: 200000,
        category: 'Investasi Syariah',
        chaptersLength: 8,
        progress: null,
    },
    {
        _id: '3',
        title: 'Manajemen Keuangan Syariah',
        imageUrl: null,
        price: 250000,
        category: 'Keuangan Syariah',
        chaptersLength: 10,
        progress: 65,
    },
    {
        _id: '4',
        title: 'Akuntansi Lembaga Keuangan Syariah',
        imageUrl: null,
        price: 180000,
        category: 'Akuntansi Syariah',
        chaptersLength: 12,
        progress: null,
    },
    {
        _id: '5',
        title: 'Zakat, Infaq, dan Sedekah',
        imageUrl: null,
        price: 120000,
        category: 'Fiqih Muamalah',
        chaptersLength: 5,
        progress: null,
    },
    {
        _id: '6',
        title: 'Perbankan Syariah Kontemporer',
        imageUrl: null,
        price: 280000,
        category: 'Perbankan Syariah',
        chaptersLength: 15,
        progress: null,
    },
];

// Categories
export const dummyCategories = [
    { _id: 'cat-1', name: 'Fiqih Muamalah' },
    { _id: 'cat-2', name: 'Investasi Syariah' },
    { _id: 'cat-3', name: 'Keuangan Syariah' },
    { _id: 'cat-4', name: 'Akuntansi Syariah' },
    { _id: 'cat-5', name: 'Perbankan Syariah' },
    { _id: 'cat-6', name: 'Asuransi Syariah' },
];

// All courses data with chapters
export const allCoursesData: { [key: string]: typeof dummyCourseData } = {
    '1': dummyCourseData,
    '2': {
        userId: 'user-123',
        course: {
            _id: '2',
            title: 'Investasi Halal & Sukuk',
            price: 200000,
            attachments: [
                'Panduan_Investasi_Syariah.pdf',
                'Analisis_Sukuk.pdf',
                'Portfolio_Halal.pdf',
            ],
            purchased: {
                'user-123': false,
            },
        },
        chapters: [
            {
                _id: 'ch-1',
                courseId: '2',
                title: 'Pengenalan Investasi Syariah',
                description: 'Memahami konsep dasar investasi dalam perspektif Islam, prinsip kehati-hatian, dan perbedaan investasi halal dengan konvensional. Belajar tentang screening syariah dan kriteria investasi yang sesuai dengan ajaran Islam.',
                playbackId: 'video-inv-1',
                isCompleted: {
                    'user-123': false,
                },
                isFree: true,
            },
            {
                _id: 'ch-2',
                courseId: '2',
                title: 'Sukuk: Obligasi Syariah',
                description: 'Mempelajari instrumen sukuk sebagai alternatif obligasi konvensional. Memahami berbagai jenis sukuk seperti ijarah, mudharabah, dan musyarakah serta mekanisme perdagangannya di pasar modal syariah.',
                playbackId: 'video-inv-2',
                isCompleted: {
                    'user-123': false,
                },
                isFree: true,
            },
            {
                _id: 'ch-3',
                courseId: '2',
                title: 'Saham Syariah',
                description: 'Mengenal kriteria pemilihan saham syariah, Daftar Efek Syariah (DES), dan analisis fundamental perusahaan dari perspektif syariah. Memahami cara membaca laporan keuangan untuk screening syariah.',
                playbackId: 'video-inv-3',
                isCompleted: {
                    'user-123': false,
                },
                isFree: false,
            },
        ],
    },
    '3': {
        userId: 'user-123',
        course: {
            _id: '3',
            title: 'Manajemen Keuangan Syariah',
            price: 250000,
            attachments: [
                'Modul_Manajemen_Keuangan_Syariah.pdf',
                'Template_Budget_Syariah.xlsx',
            ],
            purchased: {
                'user-123': true,
            },
        },
        chapters: [
            {
                _id: 'ch-1',
                courseId: '3',
                title: 'Prinsip Manajemen Keuangan Islam',
                description: 'Memahami filosofi dan prinsip-prinsip dasar manajemen keuangan dalam Islam, termasuk konsep berkah, zakat, dan tanggung jawab sosial dalam mengelola harta.',
                playbackId: 'video-mks-1',
                isCompleted: {
                    'user-123': true,
                },
                isFree: true,
            },
            {
                _id: 'ch-2',
                courseId: '3',
                title: 'Perencanaan Keuangan Keluarga Islami',
                description: 'Belajar menyusun anggaran keluarga berdasarkan prioritas syariah, mengalokasikan dana untuk kebutuhan, investasi, dan sedekah dengan proporsional.',
                playbackId: 'video-mks-2',
                isCompleted: {
                    'user-123': false,
                },
                isFree: false,
            },
        ],
    },
};

// Helper function to get course data by ID
export const getCourseDataById = (courseId: string) => {
    return allCoursesData[courseId] || null;
};