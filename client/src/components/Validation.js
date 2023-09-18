function Validation(values) {
  let error = {};
  const email_pat = /^[^\s@]+[^\s@]+\.[^\s@]+$/;
  const password_pat = /^[a-zA-Z0-9]{8,}$/;
  // (?=.*\d)(?=.*[a-z])(?=.*[A-Z])

  if(values.username === "") {
    error.username = "Name should not be empty";
  } else {
    error.username = "";
  }

  if(values.email === "") {
    error.email = "Email should not be empty";
  } else if(!email_pat.test(values.email)) {
    error.email = "Email Didn't match";
  } else {
    error.email = "";
  }

  if(values.password === "") {
    error.password = "Password should not be empty";
  } else if(!password_pat.test(values.password)) {
    error.password = "Password Didn't match";
  } else {
    error.password = "";
  }

  return error;

}

export default Validation