import { Wrapper } from "@/features/shared/components/wrapper";
import { BackButton } from "@/features/shared/components/back-button";
import { FetchNurseInfo } from "@/features/hospice/components/fetch-nurse-info";

const ViewNurseProfile = () => {
  return (
    <Wrapper>
      <BackButton title={"Profile info"} marginTop={0} />
      <FetchNurseInfo />
    </Wrapper>
  );
};
export default ViewNurseProfile;
