import type { components } from '@/types/api'
import { defineStore } from 'pinia'
import { http } from '@/services/http'
import { useUserStore } from './user'

type StudentDto = components['schemas']['StudentDto']
type PartialStudentDto = components['schemas']['PartialStudentDto']
type StudentsPageDto = components['schemas']['StudentsPageDto']

export const useStudentStore = defineStore('student', () => {
  const userStore = useUserStore()

  const isStudent = () => {
    if (userStore.loggedUser === null || userStore.loggedUser.role !== 'student') {
      throw new Error('User not logged in or not a student')
    }
  }

  const byPagination = async (queries: {
    page: number
    limit: number
  }): Promise<StudentsPageDto> => {
    const { data } = await http.get<StudentsPageDto>('/students', {
      params: {
        ...queries,
      },
    })
    return data
  }

  const partialUpdate = async (student: PartialStudentDto): Promise<StudentDto> => {
    isStudent()

    const { data } = await http.patch<StudentDto>(`/students`, student)
    userStore.fetch()
    return data
  }

  const findByUuid = async (uuid: string): Promise<StudentDto> => {
    const { data } = await http.get<StudentDto>(`/students/${uuid}`)
    return data
  }

  const uploadCurriculum = async (file: File): Promise<StudentDto> => {
    isStudent()

    const formData = new FormData()
    formData.append('file', file)
    const { data } = await http.put<StudentDto>(`/students/curriculum`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    userStore.fetch()
    return data
  }

  const uploadHistory = async (file: File): Promise<StudentDto> => {
    isStudent()

    const formData = new FormData()
    formData.append('file', file)
    const { data } = await http.put<StudentDto>(`/students/history`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    userStore.fetch()
    return data
  }

  return {
    isStudent,
    byPagination,
    partialUpdate,
    findByUuid,
    uploadCurriculum,
    uploadHistory,
  }
})
