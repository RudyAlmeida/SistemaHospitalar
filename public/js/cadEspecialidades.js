// Filtro para input da página /cadEspecialidades
function cadEspecialidades() {
  var input, filter, table, tr, td, i, txtValue
  input = document.getElementById("especialidade")
  filter = input.value.toUpperCase()
  table = document.getElementById("tabEsp")
  tr = table.getElementsByTagName("tr")
  btn = document.getElementById('cadBt')

  for (i = 0; i < tr.length; i++) {
    let tranca = 0
    td = tr[i].getElementsByTagName("td")[0]
    if (td) {
      txtValue = td.innerText || td.textContent
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = ""
      } else {
        tr[i].style.display = "none"
      }
      if(txtValue.toUpperCase() == filter){
        input.style.borderColor = "red"
        tr[i].style.borderColor = "red"
        btn.setAttribute('disabled', 'disabled')
        tranca++
        return false
      }else{
        tranca = 0
      }
      if(tranca == 0){
        input.style.borderColor = "lime"
        tr[i].style.border = "lightgray"
        btn.removeAttribute('disabled')
      }
    }
  }
  
    
  
}