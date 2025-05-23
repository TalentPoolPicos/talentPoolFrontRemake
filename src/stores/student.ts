import type { components } from '@/types/api'
import { defineStore } from 'pinia'
import { STORAGE_KEY } from './auth'
import { ref, watch } from 'vue'
import { http } from '@/services/http'

type UserDto = components['schemas']['UserDto']
type StudentDto = components['schemas']['StudentDto']
type PartialStudentDto = components['schemas']['PartialStudentDto']
type StudentsPageDto = components['schemas']['StudentsPageDto']

export const useStudentStore = defineStore('student', () => {
  const userStored = localStorage.getItem(STORAGE_KEY)
  const loggedUser = ref<UserDto | null>(userStored ? JSON.parse(userStored) : null)
  const loggedStudent = ref<StudentDto | null>(
    loggedUser.value?.student ? loggedUser.value.student : null,
  )

  watch(
    loggedUser,
    (val) => {
      if (val) localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      else localStorage.removeItem(STORAGE_KEY)
    },
    { immediate: true },
  )

  watch(loggedStudent, (val) => {
    if (val) {
      loggedUser.value = {
        ...loggedUser.value,
        student: val,
      } as UserDto
    }
  })

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
    const { data } = await http.patch<StudentDto>(`/students`, student)
    loggedStudent.value = data
    return data
  }

  const getLoggedStudent = async (): Promise<StudentDto> => {
    const { data } = await http.get<StudentDto>(`/students/${loggedUser.value?.uuid}`)
    loggedStudent.value = data
    return data
  }

  const studentByUuid = async (uuid: string): Promise<StudentDto> => {
    const { data } = await http.get<StudentDto>(`/students/${uuid}`)
    return data
  }

  const uploadCurriculum = async (file: File): Promise<StudentDto> => {
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
    studentByPagination,
    partialLoggedUpdateStudent,
    getLoggedStudent,
    studentByUuid,
    uploadCurriculum,
    uploadHistory,
  }
})
