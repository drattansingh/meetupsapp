import Head from 'next/head';

import { MongoClient } from 'mongodb';

import MeetupList from '../components/meetups/MeetupList';

function HomePage(props) {
  return(
    <>
      <Head>
        <title>React Meetups</title>
        <meta
          name='description'
          content='Browse a huge list of highly active React meetups!'
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </>
  );
}

/** getStaticProps is a reserved name used for data fetching. next.js will look for this asynchronous
 *  function name and execute it during the pre-rendering process. In other words it'll call this 
 * function before the other components in this page. The code contained is executed during the build process 
 * and will never execute on the client or server side.
 * 
 * The function always need to return an object
 * 
 * It only works in PAGE component files
 * i.e. next.js files and not the normal component files which uses react. 
 * 
 * The props property defined in the function below is accessible in the Homepage props above
 * i.e. we could now get the data from props.meetups
 * 
 * Thus data fetching is moved from the client side to the during the build process
 * 
 * This function is used a lot when working with next.js
 */
export async function getStaticProps() {
  // fetch data from an API
  const client = await MongoClient.connect(
    'mongodb+srv://root:root@cluster0.f2dq0.mongodb.net/meetups?retryWrites=true&w=majority'
  );
  const db = client.db();
  const meetupsCollection = db.collection('meetups');
  const meetups = await meetupsCollection.find().toArray();

  client.close();
  return {
    props: {
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        id: meetup._id.toString(),
      })),
    },
    /** Because this function is executed during the build process, i.e. npm run build, the data could change
     * and may not be up to date. After deploying, if we add more data , this initial data will be out of date.
     * the revalidate property unlocks incremental static generation. 1 is the amount of seconds it'll take
     * to revalidate.... a value of 10 means it'll revalidate after every 10 seconds
     */
    revalidate: 1 
  }; 
}


/** This is also a reserved function but unlike the above will not execute during the build process
 * but on the server after deployment. All the code in this function will execute on the server and never
 * on the client. It has access to request and response similar to node.js.
 * 
 * The code is guaranteed to run for every request because it's executed on the server after deployment.
 * Disadvantage is user will have to wait for page to be generated after every request.
 * 
 * If the data isn't changing regularly then the getStatisProps is better. But if the data is changing
 * regularly anc constantly, the getServerSideProps will be better
 */

// export async function getServerSideProps(context) {
//   const req = context.req;
//   const res = context.res;

//   // fetch data from an API

//   return {
//     props: {
//       meetups: DUMMY_MEETUPS
//     }
//   };
// }



export default HomePage;