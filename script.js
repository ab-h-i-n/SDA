import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

//  Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-DAFObbV9nV4eBGirHnR15cqwB0GTvVM",
    authDomain: "fir-dc-ae2fa.firebaseapp.com",
    databaseURL: "https://fir-dc-ae2fa-default-rtdb.firebaseio.com",
    projectId: "fir-dc-ae2fa",
    storageBucket: "fir-dc-ae2fa.appspot.com",
    messagingSenderId: "85786057242",
    appId: "1:85786057242:web:913f4f11a98dd3b570cfa3",
    measurementId: "G-5279S9TXH4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();

// Reference to the database node where you want to set the student counts
const areaRef = ref(db, 'area'); // Update this path if needed
const studentRef = ref(db, 'schools');
const ageRef = ref(db,'ages');

const studentCounts = {
    "area X": {
        "School A": 100,
        "School B": 190
    },
    "area Y": {
        "School C": 200,
        "School D":150
    },
    "area Z": {
        "School E": 120,
        "School F": 160
    }
};

const schoolDetails = {
    "School A": {
        "Male": 50,
        "Female": 50,
        "Hindu": 30,
        "Muslim": 25,
        "Christian": 45
    },
    "School B": {
        "Male": 95,
        "Female": 95,
        "Hindu": 57,
        "Muslim": 47,
        "Christian": 86
    },
    "School C": {
        "Male": 100,
        "Female": 100,
        "Hindu": 60,
        "Muslim": 50,
        "Christian": 90
    },
    "School D": {
        "Male": 75,
        "Female": 75,
        "Hindu": 45,
        "Muslim": 37,
        "Christian": 68
    },
    "School E": {
        "Male": 60,
        "Female": 60,
        "Hindu": 36,
        "Muslim": 30,
        "Christian": 54
    },
    "School F": {
        "Male": 80,
        "Female": 80,
        "Hindu": 48,
        "Muslim": 40,
        "Christian": 72
    }
};

const ageGroupData = {
    "10-15": {
        "School A": 35,
        "School B": 70,
        "School C": 80,
        "School D": 60,
        "School E": 50,
        "School F": 60
    },
    "15-20": {
        "School A": 65,
        "School B": 120,
        "School C": 120,
        "School D": 90,
        "School E": 70,
        "School F": 100
    }
};

set(ageRef, ageGroupData)
.then(()=>{
    console.log("Age details have been set succesfuly");
})
.catch((error)=>{
    console.error("Error!",error);
})


set(studentRef, schoolDetails)
.then(()=>{
    console.log("School details have been set succesfuly");
})
.catch((error)=>{
    console.error("Error!",error);
})

// Set the student counts in the database
set(areaRef, studentCounts)
    .then(() => {
        console.log("Student counts have been set successfully.");
    })
    .catch((error) => {
        console.error("Error setting student counts:", error);
    });

const policySelect = document.getElementById('policy');
const form = document.getElementById('dataForm');

// Reference to the database node containing student data
const studentsRef = ref(db, 'students');
let studentsData = {}; // To store the student data

// Function to populate a <select> element with data
function populateSelect(selectElement, data) {
    selectElement.innerHTML = '';
    data.forEach(item => {
        const option = new Option(item, item);
        selectElement.appendChild(option);
    });
}

const dataform = document.getElementById("dataForm");
const ratee = document.getElementById("dropoutRate");

// Function to handle policy change
function handlePolicyChange() {
    const selectedPolicy = policySelect.value;

    // Hide all selection options
    ['school', 'area', 'gender', 'caste', 'age'].forEach(key => {
        const selectDiv = document.getElementById(`${key}Select`);
        selectDiv.style.display = 'none';
    });

    ratee.style.display = "none";

    // Show the selected option
    if (selectedPolicy !== '') {
        const selectDiv = document.getElementById(`${selectedPolicy}Select`);
        selectDiv.style.display = 'block';
    }
}

// Attach event listeners
policySelect.addEventListener('change', handlePolicyChange);

// Fetch and populate data for each dropdown
onValue(studentsRef, snapshot => {
    studentsData = snapshot.val();
    const ageSelect = document.getElementById('age');
    const casteSelect = document.getElementById('caste');
    const areaSelect = document.getElementById('area');
    const genderSelect = document.getElementById('gender');
    const schoolSelect = document.getElementById('school');

    // Create arrays to store unique values for each field
    const uniqueCastes = [...new Set(Object.values(studentsData).map(student => student.caste))];
    const uniqueAreas = [...new Set(Object.values(studentsData).map(student => student.schoolArea))];
    const uniqueSchools = [...new Set(Object.values(studentsData).map(student => student.schoolName))];

    // Populate the dropdowns with unique values
    populateSelect(casteSelect, uniqueCastes);
    populateSelect(areaSelect, uniqueAreas);
    populateSelect(schoolSelect, uniqueSchools);

    // Attach event listeners to the second select options
    areaSelect.addEventListener('change', updateDropoutRate);
    genderSelect.addEventListener('change', updateDropoutRate);
    casteSelect.addEventListener('change', updateDropoutRate);
    ageSelect.addEventListener('change', updateDropoutRate);
    schoolSelect.addEventListener('change',updateDropoutRate);
});


// Initial policy change to set up the form
handlePolicyChange();


// Function to calculate dropout rate based on the selected policy
function calculateDropoutRate(selectedPolicy) {
    // Get the selected values from the dropdowns
    const selectedSchool = document.getElementById('school').value;
    const selectedArea = document.getElementById('area').value;
    const selectedGender = document.getElementById('gender').value;
    const selectedCaste = document.getElementById('caste').value;
    const selectedAge = document.getElementById('age').value;

    // Filter students based on the selected policy and values
    let filteredStudents = Object.values(studentsData);

    let totalStudents = 0;

    if (selectedPolicy === 'school') {
        filteredStudents = filteredStudents.filter(student => student.schoolName === selectedSchool);
        if (schoolDetails[selectedSchool]) {
            // Get the total students for the selected school
            totalStudents = schoolDetails[selectedSchool].Male + schoolDetails[selectedSchool].Female;
        }
    } else if (selectedPolicy === 'area') {
        // Assuming you have a variable selectedArea containing the selected area name
        filteredStudents = filteredStudents.filter(student => student.schoolArea === selectedArea);
        if (studentCounts[selectedArea]) {
            // Calculate the total students in the selected area by summing the counts of all schools in that area
            totalStudents = Object.values(studentCounts[selectedArea]).reduce((acc, count) => acc + count, 0);
        }
    } else if (selectedPolicy === 'gender') {
        filteredStudents = filteredStudents.filter(student => student.gender === selectedGender);
        if (selectedGender === 'Female') {
            // Calculate the total students as the sum of all females in all schools
            totalStudents = Object.values(schoolDetails).reduce((acc, school) => acc + (school.Female || 0), 0);
        } else {
            totalStudents = Object.values(schoolDetails).reduce((acc, school) => acc + (school.Male || 0), 0);
        }
    } else if (selectedPolicy === 'caste') {
        filteredStudents = filteredStudents.filter(student => student.caste === selectedCaste);
        if (selectedCaste === 'Hindu') {
            // Calculate the total students as the sum of all females in all schools
            totalStudents = Object.values(schoolDetails).reduce((acc, school) => acc + (school.Hindu || 0), 0);
        } else if(selectedCaste === 'Muslim'){
            totalStudents = Object.values(schoolDetails).reduce((acc, school) => acc + (school.Muslim || 0), 0);
        }else{
            totalStudents = Object.values(schoolDetails).reduce((acc,school) => acc + (school.Christian || 0),0);
        }
    } else if (selectedPolicy === 'age') {
        const ageRange = selectedAge.split('-'); // Split the selectedAge into [min, max]
    const minAge = parseInt(ageRange[0], 10);
    const maxAge = parseInt(ageRange[1], 10);

    filteredStudents = filteredStudents.filter(student => {
        const studentAge = parseInt(student.age, 10);
        return studentAge >= minAge && studentAge <= maxAge;
    });

    if (selectedAge === '10-15') {
        totalStudents = Object.values(ageGroupData['10-15']).reduce((acc, count) => acc + count, 0);
    } else {
        totalStudents = Object.values(ageGroupData['15-20']).reduce((acc, count) => acc + count, 0);
    }
    }

    // Calculate the total enrollment
    const NumOfStudents = filteredStudents.length;

    // Calculate dropout rate
    let dropoutRate = 0;
    if (NumOfStudents > 0) {
        dropoutRate = (NumOfStudents / totalStudents) * 100;
    }    
    console.log(`Number of students : ${NumOfStudents} \n totalStudents : ${totalStudents} \n Dropout Rate : ${dropoutRate}`)

    return dropoutRate;
}

function updateDropoutRate() {
    const selectedPolicy = policySelect.value;

    const dropoutRate = calculateDropoutRate(selectedPolicy);
    const dropoutRateElement = document.getElementById('dropoutRate');
    dropoutRateElement.textContent = `Dropout Rate: ${dropoutRate.toFixed(2)}%`;
}

// Attach an event listener to the policy dropdown to update the dropout rate
policySelect.addEventListener('change', updateDropoutRate);

// Initial update of dropout rate when the page loads
updateDropoutRate();


dataform.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    ratee.style.display = "block";
});

const addbtn = document.getElementById("add");

addbtn.addEventListener("click", () => {
    const urlToLoad = "https://luffy-0012223.github.io/SDC/";
    window.open(urlToLoad, "_blank"); // "_blank" opens the URL in a new tab
});
