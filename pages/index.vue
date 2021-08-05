<template>
  <b-container fluid>
    <h2 align="center">Front End Challenge (Vue.js/ Nuxt.js)</h2>
<b-list-group>
  <b-form-group>
<b-form-group>
  <b-col sm="6" md="6" lg="5">
        <b-form-group
          label="Search: "
          label-for="filter-input"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"

        >
          <b-input-group size="sm">
            <b-form-input
              id="filter-input"
              v-model="filter"
              type="search"
              placeholder="Type to Search"
            ></b-form-input>

            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
</b-form-group>
<b-col>
  <b-table
id="tb-user"
:outlined="outlined"
:fields="fields"
:items="items"
:sort-by.sync="sortBy"
:sort-desc.sync="sortDesc"
sort-icon-left
:filter="filter"
striped hover
sticky-header
head-variant="light"
:per-page="perPage"
:current-page="currentPage"
stacked="md"
      show-empty
      small
>

<template #cell(Id)="data">
  {{data.item.id}}
</template>
<template #cell(Avatar)="data">
  <b-avatar :src=data.item.avatar ></b-avatar>
</template>
<template #cell(firstName)="data">
    {{data.item.first_name}}
</template>

<template #cell(lastName)="data">
  {{data.item.last_name}}
</template>

<template #cell(fullName)="data">
  <b >{{data.item.last_name}}</b>, {{data.item.first_name}}
</template>

<template #cell(Email)="data">
{{data.item.email}}

</template>

<template #cell(actions)="data">
        <b-button size="sm" variant="primary" @click="info(data.item, $event.target)" >
          Edit
        </b-button>
        <b-button size="sm" variant="danger" @click="deleteUser(data.index)">
          Delete
        </b-button>
      </template>
</b-table>
<b-modal
      :id="infoModal.id"
      :title="infoModal.title"
      @hide="resetInfoModal"
      @ok="handleOk"

      >
      <b-avatar src:infoModal.avatar></b-avatar>

      <form ref="form">
        <b-form-group
        label ="First Name"
        :state="userState"
        >
          <b-form-input
          label="First Name"
          v-model="infoModal.firstName"
          :state='userState'
          required
          ></b-form-input>
        </b-form-group>
        <b-form-group
        label ="Last Name"
        :state="userState"
        >
          <b-form-input
          label="Last Name"
          v-model="infoModal.lastName"
          :state='userState'
          required
          ></b-form-input>
        </b-form-group>
        <b-form-group
        label ="Email"
        :state="userState"
        >
          <b-form-input
          label="ex: example@gmail.com"
          v-model="infoModal.email"
          :state='userState'
          required
          ></b-form-input>
        </b-form-group>
        <b-form-group
        label ="Image URL"
        :state="userState"
        >
          <b-form-input
          label="ex: https://example.com/hi.jpg"
          v-model="infoModal.avatar"
          :state='userState'
          required
          ></b-form-input>
          <b-button @click="editUser(infoModal)">test</b-button>
        </b-form-group>
      </form>
    </b-modal>
</b-col>
<b-col sm="2" md="3">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
        ></b-pagination>
      </b-col>

  </b-form-group>

</b-list-group>
  </b-container>
</template>

<script>
import axios from 'axios'
export default {
  layout:"mainLayout",
   asyncData(context){

      return new Promise((resolve,reject)=>{
         setTimeout(() => {
          const postData=[];
         const data1 =  axios.get("https://reqres.in/api/users?page=1")
         .then(res=>{

           for(const key in res.data.data){

             postData.push({...res.data.data[key],uid:key})
           }
           return {
             postData
           }
         })
         const data2 = axios.get("https://reqres.in/api/users?page=2")
         .then(res=>{

           for(const key in res.data.data){
             console.log(res.data.data);
             postData.push({...res.data.data[key],uid:key})
           }
           return {
             items:postData
           }
         })

         resolve(data2)
         reject("internet connection fail")
        }, 4000);
      })}
  ,data(){
    return{
      sortBy:'id',
      sortDesc:false,
      filter: null,
      outlined: true,
      totalRows: 1,
        currentPage: 1,
        perPage: 5,
        pageOptions: [5, 10, 15, { value: 100, text: "Show All" }],
        infoModal: {
          id: 'info-modal',
          uid:'',
          title:'',
          firstName: '',
          lastName: '',
          email:'',
          avatar:''
        },
        firstnamein:'',
        userState:null,
        submittedUser:[],
      fields:[

        {key:'Id', label:"ID", sortable:true},
        {key:'Avatar', label:"Avatar"},
        {key:'firstName', label:"First Name", sortable:true},
        {key:'lastName', label:"Last Name", sortable:true},
        {key:'fullName', label:"Full Name", sortable:true},
        {key: 'Email', label: 'Email' },
        {key: 'actions', label: 'Actions' },


      ]
    }
  },
  mounted() {
      // Set the initial number of items
      this.totalRows = this.items.length
    },
  computed: {
      rows() {
        return this.items.length
      }
    },
    methods: {
      rows() {
        return this.items.length
      },
      info(item, button) {
        this.infoModal.uid = item.id
        this.infoModal.title = `Editting User ID: ${item.id} Information`
        this.infoModal.firstName = item.first_name
        this.infoModal.lastName = item.last_name
        this.infoModal.email= item.email
        this.infoModal.avatar= item.avatar
        this.$root.$emit('bv::show::modal', this.infoModal.id, button)
      },
      resetInfoModal() {
        this.infoModal.uid = ''
        this.infoModal.firstName = ''
        this.infoModal.lastName =''
        this.infoModal.email = ''
        this.infoModal.avatar = ''
      },
      deleteUser(item){
        this.$delete(this.items,item)
      },
      editUser(modal){
        console.log("check function")
       var index = this.items.findIndex((item => item.id == modal.uid))
       this.items[index].first_name = modal.firstName
       this.items[index].last_name = modal.lastName
       this.items[index].email = modal.email
       this.items[index].avatar = modal.avatar
       this.$nextTick(() => {
          this.$bvModal.hide(modal.id)
        })
      },
      handleOk(bvModalEvt) {
        bvModalEvt.preventDefault()
        this.editUser(this.infoModal)
      },
    }
}
</script>
