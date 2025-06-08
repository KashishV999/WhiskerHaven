
    //email Form submission -AJAX SUBMISSION
  document.getElementById("contact-form").addEventListener("submit", function(e){
    console.log("Form triggered");
    e.preventDefault();

    const form=e.target;
    const formData=new FormData(form);
    const data={};

  //convert form data into javascript object
    formData.forEach((value, key)=>{
      data[key]=value;
    })

    console.log(data);

    fetch("/contact", {
      method:"POST",
          headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response=>response.json())
    .then(data=>{
      console.log("Success:", data);
      alert(data.message || 'Message sent successfully!');
      e.target.reset(); // clear form inputs
    })
    .catch((error)=>{
      alert('Oops! Something went wrong.');
    });

  })
