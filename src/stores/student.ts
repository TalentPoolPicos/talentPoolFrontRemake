import type { components } from '@/types/api'
import { defineStore, storeToRefs } from 'pinia'
import { useAuthStore } from './auth'
import { ref, watch } from 'vue'
import { http } from '@/services/http'

type UserDto = components['schemas']['UserDto']
type StudentDto = components['schemas']['StudentDto']
type PartialStudentDto = components['schemas']['PartialStudentDto']
type StudentsPageDto = components['schemas']['StudentsPageDto']

export const useStudentStore = defineStore('student', () => {
  const authStore = useAuthStore()
  const { loggedUser } = storeToRefs(authStore)

  const loggedStudent = ref<StudentDto | null>(
    loggedUser.value?.student ? loggedUser.value.student : null,
  )

  watch(loggedStudent, (val) => {
    if (val) {
      loggedUser.value = {
        ...loggedUser.value,
        student: val,
      } as UserDto
    }
  })

  const isStudent = () => {
    if (loggedUser.value === null || loggedUser.value.role !== 'student') {
      throw new Error('User not logged in or not a student')
    }
  }

  const studentByPagination = async (queries: {
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

  const partialLoggedUpdateStudent = async (student: PartialStudentDto): Promise<StudentDto> => {
    isStudent()

    const { data } = await http.patch<StudentDto>(`/students`, student)
    loggedStudent.value = data
    return data
  }

  const getLoggedStudent = async (): Promise<StudentDto> => {
    isStudent()

    const { data } = await http.get<StudentDto>(`/students/${loggedUser.value?.uuid}`)
    loggedStudent.value = data
    return data
  }

  const studentByUuid = async (uuid: string): Promise<StudentDto> => {
    const { data } = await http.get<StudentDto>(`/students/${uuid}`)
    return data
  }

  const uploadCurriculum = async (file: File): Promise<StudentDto> => {
    isStudent()

    const formData = new FormData()
    formData.append('file', file)
    const { data } = await http.patch<StudentDto>(`/students/curriculum`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    loggedStudent.value = data
    return data
  }

  const uploadHistory = async (file: File): Promise<StudentDto> => {
    isStudent()

    const formData = new FormData()
    formData.append('file', file)
    const { data } = await http.patch<StudentDto>(`/students/history`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    loggedStudent.value = data
    return data
  }

  return {
    loggedStudent,
    studentByPagination,
    partialLoggedUpdateStudent,
    getLoggedStudent,
    studentByUuid,
    uploadCurriculum,
    uploadHistory,
  }
})
