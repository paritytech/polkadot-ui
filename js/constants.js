const CALLS = [{
    name: 'consensus',
    calls: interpretRustCalls(`
fn report_misbehavior(aux, report: MisbehaviorReport) = 0;
    `),
    priv_calls: interpretRustCalls(`
fn set_code(new: Vec<u8>) = 0;
fn set_storage(items: Vec<KeyValue>) = 1;
    `)
},{
    name: 'session',
    calls: interpretRustCalls(`
fn set_key(aux, key: T::SessionKey) = 0;
    `),
    priv_calls: interpretRustCalls(`
fn set_length(new: T::BlockNumber) = 0;
fn force_new_session() = 1;
    `)
},{
    name: 'staking',
    calls: interpretRustCalls(`
fn transfer(aux, dest: T::AccountId, value: T::Balance) = 0;
fn stake(aux) = 1;
fn unstake(aux) = 2;
    `),
    priv_calls: interpretRustCalls(`
fn set_sessions_per_era(new: T::BlockNumber) = 0;
fn set_bonding_duration(new: T::BlockNumber) = 1;
fn set_validator_count(new: u32) = 2;
fn force_new_era() = 3;
    `)
},{
    name: 'timestamp',
    calls: [],
    priv_calls: []
},{
    name: 'treasury',
    calls: [],
    priv_calls: []
},{
    name: 'democracy',
    calls: interpretRustCalls(`
fn propose(aux, proposal: Box<T::Proposal>, value: T::Balance) = 0;
fn second(aux, proposal: PropIndex) = 1;
fn vote(aux, ref_index: ReferendumIndex, approve_proposal: bool) = 2;
    `),
    priv_calls: interpretRustCalls(`
fn start_referendum(proposal: Box<T::Proposal>, vote_threshold: VoteThreshold) = 0;
fn cancel_referendum(ref_index: ReferendumIndex) = 1;
    `)
},{
    name: 'council',
    calls: interpretRustCalls(`
fn set_approvals(aux, votes: Vec<bool>, index: VoteIndex) = 0;
fn reap_inactive_voter(aux, signed_index: u32, who: T::AccountId, who_index: u32, assumed_vote_index: VoteIndex) = 1;
fn retract_voter(aux, index: u32) = 2;
fn submit_candidacy(aux, slot: u32) = 3;
fn present_winner(aux, candidate: T::AccountId, total: T::Balance, index: VoteIndex) = 4;
    `),
    priv_calls: interpretRustCalls(`
fn set_desired_seats(count: u32) = 0;
fn remove_member(who: T::AccountId) = 1;
fn set_presentation_duration(count: T::BlockNumber) = 2;
fn set_term_duration(count: T::BlockNumber) = 3;
    `)
},{
    name: 'council_voting',
    calls: interpretRustCalls(`
fn propose(aux, proposal: Box<T::Proposal>) = 0;
fn vote(aux, proposal: T::Hash, approve: bool) = 1;
fn veto(aux, proposal_hash: T::Hash) = 2;
    `),
    priv_calls: interpretRustCalls(`
fn set_cooloff_period(blocks: T::BlockNumber) = 0;
fn set_voting_period(blocks: T::BlockNumber) = 1;
    `)
}];