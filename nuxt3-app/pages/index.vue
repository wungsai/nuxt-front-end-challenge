<template>
  <UContainer>
    <h2 class="text-center text-2xl font-bold my-4">Front End Challenge (Nuxt 3 / Nuxt UI)</h2>

    <div class="flex justify-between items-center my-4">
      <UFormGroup label="Search:" name="search" class="w-1/2">
        <UInput v-model="filter" placeholder="Type to Search" icon="i-heroicons-magnifying-glass-20-solid">
          <template #trailing>
            <UButton v-show="filter !== ''" color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" :padded="false" @click="filter = ''" />
          </template>
        </UInput>
      </UFormGroup>
    </div>

    <UTable
      :columns="columns"
      :rows="paginatedUsers"
      :loading="pending"
      :sort="sort"
      @update:sort="Object.assign(sort, $event)"
    >
      <template #avatar-data="{ row }">
        <UAvatar :src="row.avatar" :alt="`${row.first_name} ${row.last_name}`" />
      </template>
      <template #fullName-data="{ row }">
        <strong>{{ row.last_name }}</strong>, {{ row.first_name }}
      </template>
      <template #actions-data="{ row }">
        <UButton size="sm" @click="openEditModal(row)" class="mr-2">Edit</UButton>
        <UButton size="sm" color="red" @click="confirmDeleteUser(row)">Delete</UButton>
      </template>
      <template #empty-state>
        <div class="text-center py-4">
          <p v-if="pending">Loading users...</p>
          <p v-else-if="error">Error loading users: {{ error.message }}</p>
          <p v-else-if="filteredUsers.length === 0 && users.length > 0">No users match your search criteria.</p>
          <p v-else>No users found.</p>
        </div>
      </template>
    </UTable>

    <div class="flex justify-center mt-4" v-if="totalPages > 1">
      <UPagination v-model="currentPage" :page-count="perPage" :total="totalRows" />
    </div>

    <UModal v-model="isModalOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h3 class="text-lg font-semibold">{{ editingUser?.id ? 'Edit User' : 'Add User' }}</h3>
        </template>

        <UForm :state="modalFormState" @submit.prevent="saveUser">
          <UFormGroup label="First Name" name="first_name" class="mb-4">
            <UInput v-model="modalFormState.first_name" required />
          </UFormGroup>
          <UFormGroup label="Last Name" name="last_name" class="mb-4">
            <UInput v-model="modalFormState.last_name" required />
          </UFormGroup>
          <UFormGroup label="Email" name="email" class="mb-4">
            <UInput v-model="modalFormState.email" type="email" required />
          </UFormGroup>
          <UFormGroup label="Avatar URL" name="avatar" class="mb-4">
            <UInput v-model="modalFormState.avatar" type="url" />
          </UFormGroup>
          <div class="flex justify-end space-x-2">
            <UButton type="button" color="gray" @click="closeModal">Cancel</UButton>
            <UButton type="submit">Save</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
    
    <UModal v-model="isConfirmDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Confirm Deletion</h3>
        </template>
        <p>Are you sure you want to delete user: {{ userToDelete?.first_name }} {{ userToDelete?.last_name }}?</p>
        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton color="gray" @click="isConfirmDeleteModalOpen = false">Cancel</UButton>
            <UButton color="red" @click="deleteUserConfirmed">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

  </UContainer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

definePageMeta({
  layout: 'main-layout', // Nuxt 3 uses kebab-case for layout names by default
});

const users = ref([])
const pending = ref(true)
const error = ref(null)

// Fetch users
async function fetchUsers() {
  pending.value = true
  error.value = null
  try {
    const fetchedData = await $fetch('/api/users')
    if (fetchedData && fetchedData.data) {
      users.value = fetchedData.data.map(u => ({ ...u })); // Ensure reactivity by creating new objects
    } else {
      users.value = []
    }
  } catch (e) {
    error.value = e
    users.value = [] // Set to empty on error
    console.error('Error fetching users:', e)
  } finally {
    pending.value = false
  }
}

// Initial fetch
fetchUsers()

// Search filter
const filter = ref('')

// Columns definition for UTable
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'avatar', label: 'Avatar' },
  { key: 'first_name', label: 'First Name', sortable: true },
  { key: 'last_name', label: 'Last Name', sortable: true },
  { key: 'fullName', label: 'Full Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'actions', label: 'Actions' }
]

// Sorting
const sort = ref({ column: 'id', direction: 'asc' })

// Computed property for filtered users
const filteredUsers = computed(() => {
  if (!filter.value) {
    return users.value;
  }
  const lowerFilter = filter.value.toLowerCase();
  return users.value.filter(user =>
    Object.values(user).some(val =>
      String(val).toLowerCase().includes(lowerFilter)
    )
  );
});

// Pagination
const currentPage = ref(1)
const perPage = ref(5) // Number of items per page

const totalRows = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalRows.value / perPage.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredUsers.value.slice(start, end)
})

// Watch for changes in filter to reset current page to 1
watch(filter, () => {
  currentPage.value = 1;
});
watch(users, () => {
    currentPage.value = 1;
}, { deep: true });


// Modal state and editing logic
const isModalOpen = ref(false)
const editingUser = ref(null) // Stores the original user object being edited
const modalFormState = ref({
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  avatar: ''
})

function openEditModal(user) {
  editingUser.value = user // Keep a reference to the original user object
  modalFormState.value = { ...user } // Copy user data to form state for editing
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingUser.value = null
  // Reset form state
  modalFormState.value = { id: null, first_name: '', last_name: '', email: '', avatar: '' }
}

function saveUser() {
  if (editingUser.value && editingUser.value.id) { // Check if editingUser.value is not null
    // Edit existing user
    const index = users.value.findIndex(u => u.id === editingUser.value.id);
    if (index !== -1) {
      // users.value[index] = { ...modalFormState.value }; // This line was causing issues, Nuxt UI table might not pick up changes if object reference doesn't change for the row
      // To ensure reactivity, we need to update properties or replace the object
       users.value.splice(index, 1, { ...modalFormState.value });
    }
  } else {
    // Add new user (basic implementation)
    // This would typically involve a POST request to an API and then updating the local list
    const newUser = { ...modalFormState.value, id: Date.now() }; // Example ID
    users.value.unshift(newUser); // Add to the beginning of the list
  }
  closeModal();
}


// Delete user logic
const isConfirmDeleteModalOpen = ref(false);
const userToDelete = ref(null);

function confirmDeleteUser(user) {
  userToDelete.value = user;
  isConfirmDeleteModalOpen.value = true;
}

function deleteUserConfirmed() {
  if (userToDelete.value) {
    users.value = users.value.filter(u => u.id !== userToDelete.value.id);
  }
  isConfirmDeleteModalOpen.value = false;
  userToDelete.value = null;
}

</script>

<style scoped>
/* Add any page-specific styles here */
</style>
