'use client';

import { Search, Shield, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  adminEnrollUser,
  ApiError,
  authAssignRole,
  deleteUser,
  getCourses,
  getUsers,
} from '@/lib/api';

import type { Course, UserProfile, UserRole } from '@/types';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const data = await getUsers(search ? { search } : undefined);
      setUsers(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal memuat pengguna.');
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchEnrollmentOptions = useCallback(async () => {
    try {
      setError(null);
      const [studentData, courseData] = await Promise.all([
        getUsers({ role: 'student' }),
        getCourses(),
      ]);
      setStudents(studentData);
      setCourses(courseData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal memuat data enrollment.');
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  useEffect(() => {
    fetchEnrollmentOptions();
  }, [fetchEnrollmentOptions]);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setActionLoading(uid);
    try {
      setError(null);
      setSuccessMessage(null);
      await authAssignRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal mengubah role pengguna.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('Yakin ingin menonaktifkan pengguna ini?')) return;
    setActionLoading(uid);
    try {
      setError(null);
      setSuccessMessage(null);
      await deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menghapus pengguna.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnrollUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedUserId || !selectedCourseId) {
      setSuccessMessage(null);
      setError('Pilih siswa dan kursus terlebih dahulu.');
      return;
    }

    try {
      setEnrolling(true);
      setError(null);
      setSuccessMessage(null);
      await adminEnrollUser(selectedCourseId, selectedUserId);

      const selectedStudent = students.find(
        (student) => student.uid === selectedUserId
      );
      const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
      );
      const studentName =
        selectedStudent?.name || selectedStudent?.displayName || 'Siswa';
      const courseTitle = selectedCourse?.title || 'kursus';

      setSuccessMessage(
        `Berhasil mendaftarkan ${studentName} ke ${courseTitle}.`
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal mendaftarkan siswa ke kursus.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className='min-h-full bg-linear-to-br from-slate-50 to-gray-100'>
      {/* Header + Search Bar */}
      <div className='bg-primary-600 px-6 py-6'>
        <div className='max-w-4xl mx-auto space-y-3'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-1'>
              Manajemen Pengguna
            </h1>
            <p className='text-primary-100'>
              Kelola pengguna dan atur peran mereka.
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex-1 relative'>
              <input
                type='text'
                placeholder='Cari berdasarkan nama atau email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full rounded-full px-5 py-3 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300'
              />
            </div>
            <button className='bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded-full transition flex items-center gap-2 cursor-pointer'>
              <Search className='w-4 h-4' />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto p-6 lg:p-8 space-y-6'>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        {successMessage && (
          <p className='text-sm text-green-600'>{successMessage}</p>
        )}

        <div className='bg-white rounded-lg border shadow-sm p-4 md:p-6'>
          <h2 className='text-lg font-semibold text-slate-800'>
            Enroll Siswa ke Kursus
          </h2>
          <p className='text-sm text-slate-500 mt-1'>
            Pilih siswa dan kursus, lalu klik tombol enroll.
          </p>

          <form
            onSubmit={handleEnrollUser}
            className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-3'
          >
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className='px-3 py-2 border border-slate-300 rounded text-sm'
              disabled={enrolling}
            >
              <option value=''>Pilih siswa</option>
              {students.map((student) => (
                <option key={student.uid} value={student.uid}>
                  {student.name || student.displayName || 'Tanpa Nama'} (
                  {student.email})
                </option>
              ))}
            </select>

            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className='px-3 py-2 border border-slate-300 rounded text-sm'
              disabled={enrolling}
            >
              <option value=''>Pilih kursus</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <button
              type='submit'
              disabled={enrolling}
              className='bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50'
            >
              {enrolling ? 'Memproses...' : 'Enroll Siswa'}
            </button>
          </form>
        </div>

        {loading ? (
          <p className='text-sm text-muted-foreground'>Memuat pengguna...</p>
        ) : users.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Tidak ada pengguna ditemukan.
          </p>
        ) : (
          <div className='bg-white rounded-lg border shadow-sm overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-slate-50'>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Nama
                  </th>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Email
                  </th>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Role
                  </th>
                  <th className='text-left p-4 font-medium text-slate-600'>
                    Poin
                  </th>
                  <th className='text-right p-4 font-medium text-slate-600'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className='border-b last:border-b-0 hover:bg-slate-50'
                  >
                    <td className='p-4 font-medium text-slate-800'>
                      {user.name || user.displayName || '-'}
                    </td>
                    <td className='p-4 text-slate-600'>{user.email}</td>
                    <td className='p-4'>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.uid, e.target.value as UserRole)
                        }
                        disabled={actionLoading === user.uid}
                        className='px-2 py-1 border border-slate-300 rounded text-xs font-medium'
                      >
                        <option value='student'>Student</option>
                        <option value='instructor'>Instructor</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                    <td className='p-4 text-slate-600'>
                      {user.totalPoints || 0}
                    </td>
                    <td className='p-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() => handleRoleChange(user.uid, 'admin')}
                          disabled={
                            actionLoading === user.uid || user.role === 'admin'
                          }
                          className='p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30'
                          title='Set as admin'
                        >
                          <Shield className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid)}
                          disabled={actionLoading === user.uid}
                          className='p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-30'
                          title='Hapus pengguna'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
