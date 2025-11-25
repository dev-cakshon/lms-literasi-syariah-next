import UnstyledLink from '@/components/links/UnstyledLink';

// interface courseNavberRoutesProps {

// }

export const CourseNavbarRoutes = () => {
    return (
        <div className='float-end'>
            <UnstyledLink
                className='text-sm font-medium text-primary hover:underline'
                href='/my-courses'>
                Kembali ke Kursus Saya
            </UnstyledLink>
        </div>
    );
};