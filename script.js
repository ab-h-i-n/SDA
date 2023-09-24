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
const schoolsRef = ref(db, 'schools'); // Update this path if needed

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

// Set the student counts in the database
set(schoolsRef, studentCounts)
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
    const uniqueAges = [...new Set(Object.values(studentsData).map(student => student.age))];
    const uniqueCastes = [...new Set(Object.values(studentsData).map(student => student.caste))];
    const uniqueAreas = [...new Set(Object.values(studentsData).map(student => student.schoolArea))];
    const uniqueGenders = [...new Set(Object.values(studentsData).map(student => student.gender))];
    const uniqueSchools = [...new Set(Object.values(studentsData).map(student => student.schoolName))];

    // Populate the dropdowns with unique values
    populateSelect(ageSelect, uniqueAges);
    populateSelect(casteSelect, uniqueCastes);
    populateSelect(areaSelect, uniqueAreas);
    populateSelect(genderSelect, uniqueGenders);
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
    console.log(selectedSchool);
    const selectedArea = document.getElementById('area').value;
    console.log(selectedArea);
    const selectedGender = document.getElementById('gender').value;
    console.log(selectedGender);
    const selectedCaste = document.getElementById('caste').value;
    console.log(selectedCaste);
    const selectedAge = document.getElementById('age').value;
    console.log(selectedAge);

    // Filter students based on the selected policy and values
    let filteredStudents = Object.values(studentsData);

    let totalStudents = 0;

    if (selectedPolicy === 'school') {

        if(selectedSchool == 'School A'){
            totalStudents = 100;
        }else if(selectedSchool == 'School B'){
            totalStudents = 190;
        }else if(selectedSchool == 'School C'){
            totalStudents = 200;
        }else if(selectedSchool == 'School D'){
            totalStudents = 150;
        }else if(selectedSchool == 'School E'){
            totalStudents = 120;
        }else if(selectedSchool == 'School F'){
            totalStudents = 160;
        }
    } else if (selectedPolicy === 'area') {
        // Assuming you have a variable selectedArea containing the selected area name
        if (studentCounts[selectedArea]) {
            // Calculate the total students in the selected area by summing the counts of all schools in that area
            totalStudents = Object.values(studentCounts[selectedArea]).reduce((acc, count) => acc + count, 0);
        }
    } else if (selectedPolicy === 'gender') {
        filteredStudents = filteredStudents.filter(student => student.gender === selectedGender);
        console.log(filteredStudents);
    } else if (selectedPolicy === 'caste') {
        filteredStudents = filteredStudents.filter(student => student.caste === selectedCaste);
        console.log(filteredStudents);
    } else if (selectedPolicy === 'age') {
        filteredStudents = filteredStudents.filter(student => student.age === selectedAge);
        console.log(filteredStudents);
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
