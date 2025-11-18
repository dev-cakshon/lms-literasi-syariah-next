import { dummyBrowseCourses, dummyCategories } from "@/lib/dummyData";

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
    const userId = "user-123";

    const categories = dummyCategories;

    // Filter courses based on search params
    let filteredCourses = dummyBrowseCourses;

    if (searchParams.categoryId) {
        const selectedCategory = categories.find(cat => cat._id === searchParams.categoryId);
        if (selectedCategory) {
            filteredCourses = filteredCourses.filter(course => 
                course.category === selectedCategory.name
            );
        }
    }

    if (searchParams.title) {
        filteredCourses = filteredCourses.filter(course =>
            course.title.toLowerCase().includes(searchParams.title!.toLowerCase())
        );
    }

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
                <Categories items={categories} />
                <CourseList items={filteredCourses} />
            </div>
        </>
    );
};
