import { getAllCategories, getAllCourses, getCoursesByCategory } from "@/lib/firestore";

import { Categories } from "@/components/course-list/Categories";
import { CourseList } from "@/components/course-list/CourseList";
import { SearchInput } from "@/components/SearchInput";

interface SearchPageProps {
    searchParams: {
        title?: string;
        categoryId: string;
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    // Fetch categories from Firestore
    const categories = await getAllCategories();

    // Fetch courses from Firestore
    let courses = searchParams.categoryId 
        ? await getCoursesByCategory(searchParams.categoryId)
        : await getAllCourses();

    // Filter by title if search query exists
    if (searchParams.title) {
        courses = courses.filter((course: any) =>
            course.title.toLowerCase().includes(searchParams.title!.toLowerCase())
        );
    }

    // Transform Firestore data to match component expectations
    const formattedCourses = courses.map((course: any) => ({
        _id: course.id,
        title: course.title,
        imageUrl: course.imageUrl || null,
        price: course.price || 0,
        progress: null,
        category: course.categoryId || '',
        chaptersLength: course.totalChapters || 0,
    }));

    const formattedCategories = categories.map((cat: any) => ({
        _id: cat.id,
        name: cat.name || 'Uncategorized',
    }));

    return (
        <>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Jelajahi Kursus Ekonomi Syariah
                    </h1>
                    <p className="text-gray-600">
                        Temukan dan pelajari berbagai aspek ekonomi dan keuangan syariah
                    </p>
                </div>
                <SearchInput />
                <Categories items={formattedCategories} />
                <CourseList items={formattedCourses} />
            </div>
        </>
    );
};
