import { db } from '@/lib/db';
// import multer from 'multer';

// // Configure Multer for file uploads
// const upload = multer({
//   storage: multer().diskStorage({
//     destination: (request, file, callback) => {
//       callback(null, '/public/uploads')
//     },
//
//     filename: (request, file, callback) => {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       callback(null, file.fieldname + '-' + uniqueSuffix)
//     }
//   })
// });
//
// // Helper function to run Multer middleware
// function runMulterMiddleware(req) {
//   return new Promise((resolve, reject) => {
//     upload.single('photo')(req, {}, (err) => {
//       if (err) {
//         console.log("error with Multer")
//         return reject(err);
//       }
//       console.log("No errors with Multer")
//       resolve(req);
//     });
//   });
// }

// Get all radio shows: GET() app/api/radio_show
export async function GET() {
  try {
    const rows = await getAllShows();
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return new Response('Database error', { status: 500 });
  }
}

export async function getAllShows() {
  const [rows] = await db.query('SELECT * FROM RadioShows'); // Adjust query as needed
  console.log(rows);
  return rows;
}


// Create a new radio show: PUT(RadioShow) app/api/radio_show
//
// Returns:
// - 400 for missing required fields
// - 500 for general internal server error
// - 201 for successful RadioShow creation
export async function PUT(request: Request) {
  try {
    // // Process the form-data with multer
    // // Run Multer middleware to handle the file upload
    // const reqWithFile = await runMulterMiddleware(request);
    //
    // console.log(reqWithFile.body);
    //
    // // Extract form-data fields
    // const { title, description, hosts } = reqWithFile.body;
    // const file = reqWithFile.file;

    // Extract form-data fields from the request
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const hosts = formData.get('hosts');
    const photo_path = formData.get('photo');

    // Validate the input
    if (!title) {
      return new Response('Missing required field: title', { status: 400 });
    }

    if (title instanceof File || description instanceof File ||
        hosts instanceof File || photo_path instanceof File) {
      return new Response('Invalid data passed', { status: 400 });
    }

    // Save the radio show details to the database
    // const photoPath = file ? `/api/uploads/${file.filename}` : null;
    const [result] = await db.execute(
        'INSERT INTO RadioShows (title, description, hosts, photo) VALUES (?, ?, ?, ?)',
        [title, description, hosts, photo_path]
    );

    // Respond with the newly created show ID
    return new Response(JSON.stringify({ id: result.insertId }), { status: 201 });
  } catch (error) {
    console.error('Error creating radio show:', error);
    return new Response('Internal Server error', { status: 500 });
  }
}
