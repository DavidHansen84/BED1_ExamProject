async function editOrder(OrderNumber, Status) {
    let url = 'http://localhost:3000/orders/update'
    await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            orderNumber: OrderNumber,
            newStatus: Status
        })
    }).then((response) => {
        if (response.ok) {
            console.log("success")
            const resData = 'Edited order';
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        }
        const errorData = response.json();
        alert("fail")
        return Promise.reject(errorData);
    })
      .catch((response) => {
        alert("hello")
        alert(response.statusText);
      });;
}

async function editButton(id) {
    let url = 'http://localhost:3000/admin/editOrder/'
    console.log(url)
        await fetch(url + id, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edit order page';
            window.open(url + id,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}