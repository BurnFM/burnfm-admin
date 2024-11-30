import { db } from '@/lib/db';

// Get a radio show with dynamic route radio_show/{id}
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  const show_id = (await params).id

  try {
    const [rows] = await db.query('SELECT * FROM RadioShows where id = ?', [show_id]); // Adjust query as needed
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return new Response('Database error', { status: 500 });
  }
}

// Update an existing radio show: POST(RadioShow) app/api/radio_show/{id}
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  const show_id = (await params).id

  try {
    // First check the show exists in the database
    const [results] = await db.query(
        'SELECT * FROM RadioShows WHERE id = ?', [show_id]
    );

    console.log(results);

    if (results.id.length == 0) {
      return new Response('Show not found', {status: 404});
    }

    // // Process the form-data with multer
    // const multerPromise = new Promise((resolve, reject) => {
    //   upload.single('photo')(req, {}, (err) => {
    //     if (err) {
    //       return reject(err);
    //     }
    //     resolve(req.file);
    //   });
    // });

    // const file = await multerPromise;

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
    const photoPath = `api/uploads/${photo_path}`;
    const [result] = await db.execute(
        'INSERT INTO RadioShows (title, description, hosts, photo) VALUES (?, ?, ?, ?)',
        [title, description, hosts, photoPath]
    );

    // Respond with the newly created show ID
    return new Response(JSON.stringify({ id: result.insertId }), { status: 201 });
  } catch (error) {
    console.error('Error updating radio show:', error);
    return new Response('Database error', { status: 500 });
  }
}