import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabase } from './lib/supabase/client';

async function checkRefinementData() {
  console.log('🔍 Checking Refinement Data in Database');
  console.log('=====================================\n');

  try {
    // Check if refinement tables exist
    console.log('📋 Checking for refinement tables...');
    
    // Check folklore_refinement_sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('folklore_refinement_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.log('❌ folklore_refinement_sessions table error:', sessionsError.message);
    } else {
      console.log(`✅ folklore_refinement_sessions: ${sessions?.length || 0} sessions found`);
      if (sessions && sessions.length > 0) {
        console.log('\n📊 Latest Refinement Sessions:');
        sessions.forEach((session, index) => {
          console.log(`  ${index + 1}. ${session.session_name}`);
          console.log(`     ID: ${session.id}`);
          console.log(`     Monster ID: ${session.monster_id || 'N/A'}`);
          console.log(`     Initial Score: ${session.initial_qa_score || 'N/A'}`);
          console.log(`     Final Score: ${session.final_qa_score || 'N/A'}`);
          console.log(`     Iterations: ${session.total_iterations}/${session.max_iterations}`);
          console.log(`     Status: ${session.final_status || 'N/A'}`);
          console.log(`     Created: ${session.created_at}`);
          console.log('');
        });
      }
    }

    // Check folklore_refinement_iterations table
    const { data: iterations, error: iterationsError } = await supabase
      .from('folklore_refinement_iterations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (iterationsError) {
      console.log('❌ folklore_refinement_iterations table error:', iterationsError.message);
    } else {
      console.log(`✅ folklore_refinement_iterations: ${iterations?.length || 0} iterations found`);
      if (iterations && iterations.length > 0) {
        console.log('\n📊 Latest Refinement Iterations:');
        iterations.forEach((iteration, index) => {
          console.log(`  ${index + 1}. Session: ${iteration.session_id}`);
          console.log(`     Iteration: ${iteration.iteration_number}`);
          console.log(`     Issues: ${iteration.qa_issues?.length || 0}`);
          console.log(`     Actions: ${iteration.agent_actions?.length || 0}`);
          console.log(`     Improvements: ${iteration.improvements_made?.length || 0}`);
          console.log(`     Duration: ${iteration.duration_ms}ms`);
          console.log(`     Success: ${iteration.success}`);
          console.log('');
        });
      }
    }

    // Check folklore_agent_metrics table
    const { data: metrics, error: metricsError } = await supabase
      .from('folklore_agent_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (metricsError) {
      console.log('❌ folklore_agent_metrics table error:', metricsError.message);
    } else {
      console.log(`✅ folklore_agent_metrics: ${metrics?.length || 0} metrics found`);
      if (metrics && metrics.length > 0) {
        console.log('\n📊 Latest Agent Metrics:');
        metrics.forEach((metric, index) => {
          console.log(`  ${index + 1}. Agent: ${metric.agent_name}`);
          console.log(`     Session: ${metric.session_id}`);
          console.log(`     Action: ${metric.action_taken}`);
          console.log(`     Duration: ${metric.duration_ms}ms`);
          console.log(`     Success: ${metric.success}`);
          console.log('');
        });
      }
    }

    // Check monsters with refinement data
    const { data: monsters, error: monstersError } = await supabase
      .from('folklore_monsters')
      .select('*')
      .not('refinement_session_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (monstersError) {
      console.log('❌ folklore_monsters table error:', monstersError.message);
    } else {
      console.log(`✅ Monsters with refinement: ${monsters?.length || 0} found`);
      if (monsters && monsters.length > 0) {
        console.log('\n📊 Latest Refined Monsters:');
        monsters.forEach((monster, index) => {
          console.log(`  ${index + 1}. ${monster.name} (${monster.region})`);
          console.log(`     ID: ${monster.id}`);
          console.log(`     Refinement Session: ${monster.refinement_session_id}`);
          console.log(`     Initial Score: ${monster.initial_qa_score || 'N/A'}`);
          console.log(`     Final Score: ${monster.final_qa_score || 'N/A'}`);
          console.log(`     Iterations: ${monster.refinement_iterations || 0}`);
          console.log(`     Success: ${monster.refinement_success}`);
          console.log(`     Created: ${monster.created_at}`);
          console.log('');
        });
      }
    }

    // Check if refinement tables exist at all
    console.log('\n🔍 Checking if refinement tables exist...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'folklore_refinement%');

    if (tablesError) {
      console.log('❌ Could not check table existence:', tablesError.message);
    } else {
      console.log('📋 Refinement tables found:');
      tables?.forEach(table => {
        console.log(`  ✅ ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking refinement data:', error);
  }
}

async function getDetailedRefinementInfo(monsterId: string) {
  console.log(`\n🔍 Detailed Refinement Info for Monster: ${monsterId}`);
  console.log('===============================================\n');

  try {
    // Get monster details
    const { data: monster, error: monsterError } = await supabase
      .from('folklore_monsters')
      .select('*')
      .eq('id', monsterId)
      .single();

    if (monsterError) {
      console.log('❌ Error getting monster:', monsterError.message);
      return;
    }

    console.log('📋 Monster Details:');
    console.log(`  Name: ${monster.name}`);
    console.log(`  Region: ${monster.region}`);
    console.log(`  Refinement Session: ${monster.refinement_session_id}`);
    console.log(`  Initial QA Score: ${monster.initial_qa_score || 'N/A'}`);
    console.log(`  Final QA Score: ${monster.final_qa_score || 'N/A'}`);
    console.log(`  Iterations: ${monster.refinement_iterations || 0}`);
    console.log(`  Success: ${monster.refinement_success}`);
    console.log(`  Created: ${monster.created_at}`);
    console.log('');

    if (monster.refinement_session_id) {
      // Get refinement session details
      const { data: session, error: sessionError } = await supabase
        .from('folklore_refinement_sessions')
        .select('*')
        .eq('id', monster.refinement_session_id)
        .single();

      if (sessionError) {
        console.log('❌ Error getting session:', sessionError.message);
      } else {
        console.log('📊 Refinement Session:');
        console.log(`  Session Name: ${session.session_name}`);
        console.log(`  Initial Score: ${session.initial_qa_score || 'N/A'}`);
        console.log(`  Final Score: ${session.final_qa_score || 'N/A'}`);
        console.log(`  Iterations: ${session.total_iterations}/${session.max_iterations}`);
        console.log(`  Status: ${session.final_status}`);
        console.log(`  Duration: ${session.total_duration_ms}ms`);
        console.log(`  Created: ${session.created_at}`);
        console.log(`  Completed: ${session.completed_at || 'N/A'}`);
        console.log('');

        // Get iterations for this session
        const { data: iterations, error: iterationsError } = await supabase
          .from('folklore_refinement_iterations')
          .select('*')
          .eq('session_id', monster.refinement_session_id)
          .order('iteration_number', { ascending: true });

        if (iterationsError) {
          console.log('❌ Error getting iterations:', iterationsError.message);
        } else {
          console.log(`📊 Iterations (${iterations?.length || 0}):`);
          iterations?.forEach((iteration, index) => {
            console.log(`  ${index + 1}. Iteration ${iteration.iteration_number}:`);
            console.log(`     Issues: ${iteration.qa_issues?.length || 0}`);
            console.log(`     Actions: ${iteration.agent_actions?.length || 0}`);
            console.log(`     Improvements: ${iteration.improvements_made?.length || 0}`);
            console.log(`     Duration: ${iteration.duration_ms}ms`);
            console.log(`     Success: ${iteration.success}`);
            console.log(`     Created: ${iteration.created_at}`);
            
            // Show detailed issues if any
            if (iteration.qa_issues && iteration.qa_issues.length > 0) {
              console.log(`     Issues Details:`);
              iteration.qa_issues.forEach((issue: any, i: number) => {
                console.log(`       ${i + 1}. [${issue.category}] ${issue.issue} (${issue.severity})`);
              });
            }
            
            // Show detailed actions if any
            if (iteration.agent_actions && iteration.agent_actions.length > 0) {
              console.log(`     Actions Details:`);
              iteration.agent_actions.forEach((action: any, i: number) => {
                console.log(`       ${i + 1}. ${action.agent_name}: ${action.action_taken}`);
              });
            }
            
            console.log('');
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error getting detailed refinement info:', error);
  }
}

// Get detailed info for the latest monster
async function getLatestMonsterDetails() {
  const { data: latestMonster } = await supabase
    .from('folklore_monsters')
    .select('id')
    .not('refinement_session_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (latestMonster) {
    await getDetailedRefinementInfo(latestMonster.id);
  }
}

checkRefinementData()
  .then(() => getLatestMonsterDetails())
  .catch(console.error); 