<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api.js'

const workouts   = ref([])
const loading    = ref(true)
const errorMsg   = ref('')

const newWorkout  = ref({ name: '', duration: '', status: 'pending' })
const addError    = ref('')
const addLoading  = ref(false)

const editWorkout  = ref({ _id: '', name: '', duration: '', status: 'pending' })
const editError    = ref('')
const editLoading  = ref(false)

const completingId = ref(null)
const deletingId   = ref(null)

// Stats
const totalWorkouts = computed(() => workouts.value.length)
const completedCount = computed(() => workouts.value.filter(w => w.status === 'completed').length)
const totalMinutes = computed(() => workouts.value.reduce((sum, w) => sum + (Number(w.duration) || 0), 0))

let addModalInstance  = null
let editModalInstance = null

function openAddModal() {
  newWorkout.value = { name: '', duration: '', status: 'pending' }
  addError.value = ''
  addModalInstance = new window.bootstrap.Modal(document.getElementById('addWorkoutModal'))
  addModalInstance.show()
}
function closeAddModal() { addModalInstance?.hide() }

function openEditModal(workout) {
  editWorkout.value = { _id: workout._id, name: workout.name, duration: workout.duration, status: workout.status }
  editError.value = ''
  editModalInstance = new window.bootstrap.Modal(document.getElementById('editWorkoutModal'))
  editModalInstance.show()
}
function closeEditModal() { editModalInstance?.hide() }

async function fetchWorkouts() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.get('/workouts/getMyWorkouts')
    workouts.value = res.data.workouts
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Failed to load workouts.'
  } finally {
    loading.value = false
  }
}

async function addWorkout() {
  addError.value = ''
  if (!newWorkout.value.name.trim() || !newWorkout.value.duration) {
    addError.value = 'Name and duration are required.'
    return
  }
  addLoading.value = true
  try {
    await api.post('/workouts/addWorkout', {
      name: newWorkout.value.name,
      duration: Number(newWorkout.value.duration),
      status: newWorkout.value.status,
    })
    closeAddModal()
    await fetchWorkouts()
  } catch (err) {
    addError.value = err.response?.data?.message || 'Failed to add workout.'
  } finally {
    addLoading.value = false
  }
}

async function saveEdit() {
  editError.value = ''
  if (!editWorkout.value.name.trim() || !editWorkout.value.duration) {
    editError.value = 'Name and duration are required.'
    return
  }
  editLoading.value = true
  try {
    await api.patch(`/workouts/updateWorkout/${editWorkout.value._id}`, {
      name: editWorkout.value.name,
      duration: Number(editWorkout.value.duration),
      status: editWorkout.value.status,
    })
    closeEditModal()
    await fetchWorkouts()
  } catch (err) {
    editError.value = err.response?.data?.message || 'Failed to update workout.'
  } finally {
    editLoading.value = false
  }
}

async function completeWorkout(id) {
  completingId.value = id
  try {
    await api.patch(`/workouts/completeWorkoutStatus/${id}`)
    await fetchWorkouts()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to mark as complete.')
  } finally {
    completingId.value = null
  }
}

async function deleteWorkout(id) {
  if (!confirm('Delete this workout?')) return
  deletingId.value = id
  try {
    await api.delete(`/workouts/deleteWorkout/${id}`)
    await fetchWorkouts()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete workout.')
  } finally {
    deletingId.value = null
  }
}

function statusBadge(status) {
  return { pending: 'ff-badge-pending', completed: 'ff-badge-completed', skipped: 'ff-badge-skipped' }[status] ?? 'ff-badge-skipped'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(fetchWorkouts)
</script>

<template>
  <div class="ff-page">
    <div class="container-lg" style="max-width: 1100px;">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style="font-weight: 800; font-size: 1.6rem; margin: 0;">My Workouts</h2>
          <p style="color: var(--ff-muted); font-size: 0.875rem; margin: 0.25rem 0 0;">Track and crush your fitness goals</p>
        </div>
        <button class="ff-add-btn" @click="openAddModal">
          <i class="bi bi-plus-lg me-1"></i> Add Workout
        </button>
      </div>

      <!-- Stats -->
      <div class="row g-3 mb-4" v-if="workouts.length > 0">
        <div class="col-4">
          <div class="ff-stat">
            <div class="ff-stat-value">{{ totalWorkouts }}</div>
            <div class="ff-stat-label">Total</div>
          </div>
        </div>
        <div class="col-4">
          <div class="ff-stat">
            <div class="ff-stat-value">{{ completedCount }}</div>
            <div class="ff-stat-label">Completed</div>
          </div>
        </div>
        <div class="col-4">
          <div class="ff-stat">
            <div class="ff-stat-value">{{ totalMinutes }}</div>
            <div class="ff-stat-label">Minutes</div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="ff-alert-danger mb-4">{{ errorMsg }}</div>

      <!-- Loading -->
      <div v-if="loading" class="ff-empty">
        <div class="ff-spinner ff-spinner-green" style="width: 2rem; height: 2rem; border-width: 3px;"></div>
        <p style="margin-top: 1rem;">Loading your workouts...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="workouts.length === 0" class="ff-empty">
        <div class="ff-empty-icon">
          <i class="bi bi-clipboard-plus" style="color: var(--ff-muted);"></i>
        </div>
        <h5 style="font-weight: 700; color: var(--ff-text);">No workouts yet</h5>
        <p style="font-size: 0.875rem;">Hit the button above to log your first workout.</p>
      </div>

      <!-- Cards -->
      <div v-else class="row g-3">
        <div v-for="workout in workouts" :key="workout._id" class="col-12 col-sm-6 col-lg-4">
          <div class="ff-workout-card">

            <!-- Title + badge -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h6 style="font-weight: 700; font-size: 1rem; margin: 0; flex: 1; padding-right: 0.5rem;">{{ workout.name }}</h6>
              <span :class="statusBadge(workout.status)">{{ workout.status }}</span>
            </div>

            <!-- Meta -->
            <div style="color: var(--ff-muted); font-size: 0.8rem; margin-bottom: 0.4rem;">
              <i class="bi bi-clock me-1"></i> <strong style="color: var(--ff-text);">{{ workout.duration }} min</strong>
            </div>
            <div style="color: var(--ff-muted); font-size: 0.8rem; margin-bottom: 1rem;">
              <i class="bi bi-calendar3 me-1"></i> {{ formatDate(workout.dateAdded) }}
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2">
              <button
                v-if="workout.status !== 'completed'"
                class="ff-btn-complete"
                :disabled="completingId === workout._id"
                @click="completeWorkout(workout._id)"
              >
                <span v-if="completingId === workout._id" class="ff-spinner" style="border-top-color: var(--ff-green); border-color: rgba(57,255,20,0.2);"></span>
                <i v-else class="bi bi-check2 me-1"></i>Done
              </button>
              <button class="ff-btn-edit" @click="openEditModal(workout)">
                <i class="bi bi-pencil me-1"></i>Edit
              </button>
              <button
                class="ff-btn-delete"
                :disabled="deletingId === workout._id"
                @click="deleteWorkout(workout._id)"
              >
                <span v-if="deletingId === workout._id" class="ff-spinner" style="border-top-color: #ff6b6b; border-color: rgba(255,77,77,0.2);"></span>
                <i v-else class="bi bi-trash"></i>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- ADD MODAL -->
    <div class="modal fade ff-modal" id="addWorkoutModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" style="font-weight: 700;">
              <i class="bi bi-plus-circle me-2" style="color: var(--ff-green);"></i>New Workout
            </h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="addError" class="ff-alert-danger mb-3">{{ addError }}</div>
            <form @submit.prevent="addWorkout">
              <div class="mb-3">
                <label class="ff-label">Workout Name</label>
                <input v-model="newWorkout.name" type="text" class="ff-input" placeholder="e.g. Morning Run" required />
              </div>
              <div class="mb-3">
                <label class="ff-label">Duration (minutes)</label>
                <input v-model="newWorkout.duration" type="number" class="ff-input" placeholder="e.g. 45" min="1" onkeypress="return event.charCode >= 48 && event.charCode <= 57" required />
              </div>
              <div class="mb-4">
                <label class="ff-label">Status</label>
                <select v-model="newWorkout.status" class="ff-select">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="ff-modal-btn-primary" :disabled="addLoading">
                  <span v-if="addLoading" class="ff-spinner"></span>
                  {{ addLoading ? 'Adding...' : 'Add Workout' }}
                </button>
                <button type="button" class="ff-modal-btn-cancel" @click="closeAddModal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div class="modal fade ff-modal" id="editWorkoutModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" style="font-weight: 700;">
              <i class="bi bi-pencil me-2" style="color: #818cf8;"></i>Edit Workout
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="editError" class="ff-alert-danger mb-3">{{ editError }}</div>
            <form @submit.prevent="saveEdit">
              <div class="mb-3">
                <label class="ff-label">Workout Name</label>
                <input v-model="editWorkout.name" type="text" class="ff-input" required />
              </div>
              <div class="mb-3">
                <label class="ff-label">Duration (minutes)</label>
                <input v-model="editWorkout.duration" type="number" class="ff-input" min="1" onkeypress="return event.charCode >= 48 && event.charCode <= 57" required />
              </div>
              <div class="mb-4">
                <label class="ff-label">Status</label>
                <select v-model="editWorkout.status" class="ff-select">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="ff-modal-btn-primary" :disabled="editLoading">
                  <span v-if="editLoading" class="ff-spinner"></span>
                  {{ editLoading ? 'Saving...' : 'Save Changes' }}
                </button>
                <button type="button" class="ff-modal-btn-cancel" @click="closeEditModal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
