import Head from 'next/head';

import { MongoClient, ObjectId } from 'mongodb';

import MeetupDetail from '../../components/meetups/MeetupDetail';

function MeetupDetails(props) {
  return (
    <>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta name='description' content={props.meetupData.description} />
      </Head>
      <MeetupDetail
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </>
  );
}


/** getStaticPaths is another pre-defined function in next.js. getStaticPaths we need to export in a page
 * component if its a dynamic page and if we're using getStaticProps. This is because if the user enters
 * an ID at runtime for which we didn't pre-generate a page they'll see a 404 error.
 * 
 * The function returns an object that describes all the dynamic segment values, in this case the meetupIDs
 * 
 * After we'll be retrieving these IDs from the Database
 */
export async function getStaticPaths() {
  const client = await MongoClient.connect(
    'mongodb+srv://root:root@cluster0.f2dq0.mongodb.net/meetups?retryWrites=true&w=majority'
  );
  const db = client.db();
  const meetupsCollection = db.collection('meetups');
  const meetups = await meetupsCollection.find({}, { _id: 1 }).toArray();

  client.close();

  return {
    /***If fallback is false, then any paths not returned by getStaticPaths will result in a 404 page.
     * 
    If fallback is true, then the behavior of getStaticProps changes:

    The paths returned from getStaticPaths will be rendered to HTML at build time.
    The paths that have not been generated at build time will not result in a 404 page. 
    Instead, Next.js will serve a “fallback” version of the page on the first request to such a path.
    In the background, Next.js will statically generate the requested path. Subsequent requests to the 
    same path will serve the generated page, just like other pages pre-rendered at build time.
    If fallback is blocking, then new paths will be server-side rendered with getStaticProps, and 
    cached for future requests so it only happens once per path. */

      /** fallback: false tells that path array that it has ALL the supported params values and will 
       * display a 404 error it a param is entered that is not contained in the params list.
       * true means it contains some of them and if a param entered not in the list, it'll return 
       * a dummy page that has been previously loaded before probably from the cache
       * 
       * If we set fallback to false, any request for pages that werent generated before will fail
       * It will work for development but will fail after deployment
       * 
       * fallback of blocking tells next.js the list of paths might not be exhaustive and there might be 
       * more valid pages. Difference between true and blocking is true shows an empty page and downloads
       * the contents whereas blocking generates the entire page on the server and then shows that page
       * to the user
       */
    fallback: "blocking",
    paths: meetups.map((meetup) => ({ // the getStatidPaths needs the paths object with params key with all key/value pairs
      params: { meetupId: meetup._id.toString() },
    })),
  };
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
export async function getStaticProps(context) {
  // fetch data for a single meetup

  // retreving the params in the URL
  const meetupId = context.params.meetupId;

  const client = await MongoClient.connect(
    'mongodb+srv://root:root@cluster0.f2dq0.mongodb.net/meetups?retryWrites=true&w=majority'
  );
  const db = client.db();
  const meetupsCollection = db.collection('meetups');
  const selectedMeetup = await meetupsCollection.findOne({
    /**_id is the auto generated id of the meetupid above which is converted to object via ObjectId */
    _id: ObjectId(meetupId), //_id is the auto generated id of the meetupid above
  });

  client.close();

  return {
    props: {
      meetupData: {
        id: selectedMeetup._id.toString(),
        title: selectedMeetup.title,
        address: selectedMeetup.address,
        image: selectedMeetup.image,
        description: selectedMeetup.description,
      },
    },
  };
}

export default MeetupDetails;